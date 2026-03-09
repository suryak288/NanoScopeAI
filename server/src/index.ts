import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import { AIService } from './services/ai.service';
import { AuthService } from './services/auth.service';
import { PDFService } from './services/pdf.service';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import fastifyStatic from '@fastify/static';

const prisma = new PrismaClient();
const server: FastifyInstance = Fastify({ logger: true });

async function build() {
    await server.register(cors, { origin: '*' });

    // Register static file serving for uploads directory
    await server.register(fastifyStatic, {
        root: path.join(process.cwd(), 'uploads'),
        prefix: '/uploads/',
    });

    // Register multipart plugin to handle file uploads
    await server.register(multipart, {
        limits: {
            fileSize: 50 * 1024 * 1024 // 50MB
        }
    });

    await server.register(jwt, {
        secret: process.env.JWT_SECRET || 'supersecret_nanoscope_key'
    });

    server.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.status(401).send({ success: false, error: 'Unauthorized: Invalid or missing token' });
        }
    });

    // Auth Routes
    server.post('/api/auth/register', async (request: any, reply) => {
        try {
            const { email, password } = request.body;
            if (!email || !password) return reply.code(400).send({ success: false, error: 'Email and password required' });

            const user = await AuthService.register(email, password);
            const token = server.jwt.sign({ id: user.id, email: user.email });
            return { success: true, token, user };
        } catch (error: any) {
            return reply.code(400).send({ success: false, error: error.message });
        }
    });

    server.post('/api/auth/login', async (request: any, reply) => {
        try {
            const { email, password } = request.body;
            if (!email || !password) return reply.code(400).send({ success: false, error: 'Email and password required' });

            const user = await AuthService.login(email, password);
            const token = server.jwt.sign({ id: user.id, email: user.email });
            return { success: true, token, user };
        } catch (error: any) {
            return reply.code(401).send({ success: false, error: error.message });
        }
    });

    server.post('/api/auth/logout', async (request, reply) => {
        // Since JWT is stateless, logout is typically handled client-side by dropping the token.
        // We provide the endpoint for completeness and possible cookie clearing in the future.
        return { success: true, message: 'Logged out successfully' };
    });

    server.get('/api/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });

    server.get('/api/user/me', { onRequest: [(server as any).authenticate] }, async (request: any, reply) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: request.user.id },
                select: { id: true, email: true, plan: true, analysis_count: true, created_at: true }
            });
            if (!user) return reply.code(404).send({ success: false, error: 'User not found' });
            return { success: true, data: user };
        } catch (error) {
            server.log.error(error);
            return reply.code(500).send({ success: false, error: 'Failed to fetch user' });
        }
    });

    // 1. Upload route
    server.post('/api/upload', { onRequest: [(server as any).authenticate] }, async (request, reply) => {
        try {
            const data = await request.file();
            if (!data) {
                return reply.code(400).send({ success: false, error: 'No file uploaded' });
            }

            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/tiff', 'image/bmp', 'image/webp', 'image/gif'];
            if (!validTypes.includes(data.mimetype)) {
                return reply.code(400).send({ success: false, error: 'Invalid file type. Only images are allowed.' });
            }

            const buffer = await data.toBuffer();

            // Save file locally
            const safeFilename = `${Date.now()}_${data.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const uploadDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            fs.writeFileSync(path.join(uploadDir, safeFilename), buffer);

            return {
                success: true,
                data: {
                    file_name: safeFilename,
                    url: `/uploads/${safeFilename}`
                }
            };
        } catch (error) {
            server.log.error(error);
            return reply.code(500).send({ success: false, error: 'Upload failed' });
        }
    });

    // 2. Analyze route
    server.post('/api/analyze', { onRequest: [(server as any).authenticate] }, async (request: any, reply) => {
        try {
            const data = await request.file();
            if (!data) {
                return reply.code(400).send({ success: false, error: 'No file uploaded for analysis' });
            }

            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/tiff', 'image/bmp', 'image/webp', 'image/gif'];
            if (!validTypes.includes(data.mimetype)) {
                return reply.code(400).send({ success: false, error: 'Invalid file type. Only images are allowed.' });
            }

            const buffer = await data.toBuffer();
            const result = await AIService.analyzeImage(data.filename, buffer, request.user.id);

            return { success: true, data: result };
        } catch (error: any) {
            server.log.error(error);
            return reply.code(500).send({ success: false, error: error.message || 'Analysis pipeline failed' });
        }
    });

    // 3. Get all analyses
    server.get('/api/analyses', { onRequest: [(server as any).authenticate] }, async (request: any, reply) => {
        try {
            const history = await AIService.getHistory(request.user.id);
            return { success: true, data: history };
        } catch (error) {
            server.log.error(error);
            return reply.code(500).send({ success: false, error: 'Failed to fetch analyses' });
        }
    });

    // 4. Get specific analysis
    server.get('/api/analysis/:id', { onRequest: [(server as any).authenticate] }, async (request: any, reply) => {
        try {
            const { id } = request.params;
            const analysis = await prisma.analysis.findFirst({ where: { id, user_id: request.user.id } });
            if (!analysis) {
                return reply.code(404).send({ success: false, error: 'Analysis not found' });
            }
            return { success: true, data: analysis };
        } catch (error) {
            server.log.error(error);
            return reply.code(500).send({ success: false, error: 'Failed to fetch analysis details' });
        }
    });

    // 5. Export analysis as PDF
    server.get('/api/analysis/:id/export', { onRequest: [(server as any).authenticate] }, async (request: any, reply) => {
        try {
            const { id } = request.params;
            const analysis = await prisma.analysis.findFirst({ where: { id, user_id: request.user.id } });
            if (!analysis) {
                return reply.code(404).send({ success: false, error: 'Analysis not found' });
            }

            const pdfBuffer = await PDFService.generateAnalysisReport(analysis);

            reply.header('Content-Type', 'application/pdf');
            reply.header('Content-Disposition', `attachment; filename="NanoScope_Report_${id}.pdf"`);
            return reply.send(pdfBuffer);
        } catch (error) {
            server.log.error(error);
            return reply.code(500).send({ success: false, error: 'Failed to generate PDF report' });
        }
    });

    return server;
}

const start = async () => {
    try {
        const app = await build();
        await app.listen({ port: 3001, host: '0.0.0.0' });
        console.log(`Server listening on http://localhost:3001`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
