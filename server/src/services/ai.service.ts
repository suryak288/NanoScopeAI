import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Simulated AI Image Analysis Service
export class AIService {
    static async analyzeImage(filename: string, fileBuffer: Buffer, userId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User not found");

        let limit = 100;
        if (user.plan === 'student') limit = 1000;
        else if (user.plan === 'research') limit = Infinity;

        if (user.analysis_count >= limit) {
            throw new Error(`Your ${user.plan} plan has reached its limit of ${limit} analyses. Please upgrade your plan.`);
        }

        // Stage 1: Save to local uploads folder
        const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(uploadDir, safeFilename), fileBuffer);
        const mockImageUrl = `/uploads/${safeFilename}`;

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Stage 2: Vision Analysis (mocked results based on image complexity)
        const particleCount = Math.floor(Math.random() * 2000) + 100;
        const avgSize = (Math.random() * 50 + 5).toFixed(1);
        const minSize = (parseFloat(avgSize) * 0.2).toFixed(1);
        const maxSize = (parseFloat(avgSize) * 2.5).toFixed(1);

        // Stage 3: Annotated Visualization
        const mockAnnotatedUrl = mockImageUrl;

        // Stage 4: Insights Diagram
        const mockInsightsUrl = mockImageUrl;

        // Generating mock distribution data
        const size_distribution = [
            { range: '0-10 nm', count: Math.floor(particleCount * 0.1) },
            { range: '10-20 nm', count: Math.floor(particleCount * 0.4) },
            { range: '20-30 nm', count: Math.floor(particleCount * 0.3) },
            { range: '30-40 nm', count: Math.floor(particleCount * 0.15) },
            { range: '40+ nm', count: Math.floor(particleCount * 0.05) },
        ];

        const shape_distribution = [
            { name: 'Spherical', value: 70 },
            { name: 'Elliptical', value: 15 },
            { name: 'Irregular', value: 10 },
            { name: 'Agglomerated', value: 5 },
        ];

        // Stage 5: Data Storage
        const [analysisRecord] = await prisma.$transaction([
            prisma.analysis.create({
                data: {
                    image_url: mockImageUrl,
                    image_name: filename,
                    annotated_image_url: mockAnnotatedUrl,
                    insights_diagram_url: mockInsightsUrl,
                    image_type: 'Unknown Microscopy',
                    particle_count: particleCount,
                    average_size: parseFloat(avgSize),
                    min_size: parseFloat(minSize),
                    max_size: parseFloat(maxSize),
                    standard_deviation: parseFloat((Math.random() * 5).toFixed(1)),
                    uniformity_index: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),
                    size_distribution,
                    shape_distribution,
                    analysis_notes: `Automated AI analysis completed. Detected high density of elements with predominantly spherical morphology. Average size is ${avgSize} nm.`,
                    status: 'COMPLETED',
                    user_id: userId
                }
            }),
            prisma.user.update({
                where: { id: userId },
                data: { analysis_count: { increment: 1 } }
            })
        ]);

        return analysisRecord;
    }

    static async getHistory(userId: string) {
        return prisma.analysis.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 20
        });
    }
}
