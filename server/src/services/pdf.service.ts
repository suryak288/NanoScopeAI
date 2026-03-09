import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export class PDFService {
    static generateAnalysisReport(analysis: any): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });

                // Title
                doc.fontSize(24).font('Helvetica-Bold').fillColor('#2563eb')
                    .text('NanoScope AI Analysis Report', { align: 'center' });
                doc.moveDown(0.5);

                doc.fontSize(12).font('Helvetica').fillColor('#6b7280')
                    .text(`Date: ${new Date(analysis.created_at).toLocaleString()}`, { align: 'center' });
                doc.moveDown(2);

                // Image Title
                doc.fontSize(16).font('Helvetica-Bold').fillColor('#111827')
                    .text(`Image: ${analysis.image_name}`);
                doc.moveDown(1);

                // Analysis Notes
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151')
                    .text('Analysis Summary');
                doc.moveDown(0.5);
                doc.fontSize(12).font('Helvetica').fillColor('#4b5563')
                    .text(analysis.analysis_notes || 'No notes available.', { align: 'justify' });
                doc.moveDown(2);

                // Key Metrics
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151')
                    .text('Key Metrics');
                doc.moveDown(0.5);

                doc.fontSize(12).font('Helvetica').fillColor('#4b5563');
                doc.text(`Total Elements Detected: ${analysis.particle_count.toLocaleString()}`);
                doc.text(`Average Size: ${analysis.average_size} nm`);
                doc.text(`Standard Deviation: +/- ${analysis.standard_deviation} nm`);
                doc.text(`Uniformity Index: ${analysis.uniformity_index}`);
                doc.moveDown(2);

                // Size Distribution
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151')
                    .text('Size Distribution');
                doc.moveDown(0.5);
                doc.font('Helvetica');
                analysis.size_distribution.forEach((item: any) => {
                    doc.text(`  •  ${item.range}: ${item.count} elements`);
                });
                doc.moveDown(2);

                // Morphology
                doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151')
                    .text('Morphology Analysis');
                doc.moveDown(0.5);
                doc.font('Helvetica');
                analysis.shape_distribution.forEach((item: any) => {
                    doc.text(`  •  ${item.name}: ${item.value}%`);
                });
                doc.moveDown(2);

                // Visualizations
                doc.addPage();
                doc.fontSize(16).font('Helvetica-Bold').fillColor('#111827')
                    .text('Visualizations');
                doc.moveDown(1);

                const renderImage = async (title: string, imageUrl: string) => {
                    doc.fontSize(14).font('Helvetica-Bold').fillColor('#374151').text(title);
                    doc.moveDown(0.5);

                    try {
                        let buffer: Buffer;

                        if (imageUrl.startsWith('/uploads/')) {
                            // Read from local filesystem
                            const localPath = path.join(process.cwd(), imageUrl);
                            buffer = fs.readFileSync(localPath);
                        } else {
                            // Fetch from external URL (legacy Cloudinary images)
                            const response = await fetch(imageUrl);
                            if (!response.ok) throw new Error('Failed to fetch image');
                            const arrayBuffer = await response.arrayBuffer();
                            buffer = Buffer.from(arrayBuffer);
                        }

                        doc.image(buffer, {
                            fit: [450, 400],
                            align: 'center',
                            valign: 'center'
                        });
                        // Add vertical space according to image height manually or constant block
                        doc.moveDown(15);
                    } catch (e) {
                        doc.fontSize(10).font('Helvetica-Oblique').fillColor('red').text('(Failed to load image)');
                        doc.moveDown(2);
                    }
                };

                await renderImage('Original Image', analysis.image_url);
                doc.moveDown(2);
                await renderImage('AI Annotated Image', analysis.annotated_image_url);
                doc.moveDown(2);
                await renderImage('Insights Diagram', analysis.insights_diagram_url);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
}
