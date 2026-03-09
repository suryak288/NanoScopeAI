import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function clean() {
    const analyses = await prisma.analysis.findMany();
    let deletedCount = 0;

    for (const a of analyses) {
        let isBroken = false;
        if (a.image_url.startsWith('http')) {
            // It's a Cloudinary URL, but the frontend is trying to load it from /uploads/. 
            // It's broken on UI unless we fix frontend. Wait, if we just delete them, we don't need to fix frontend.
            // But let's check if the file actually exists locally for some reason.
            isBroken = true;
        } else {
            // Local file, check if it exists
            const filename = a.image_url.split('/').pop();
            const filePath = path.join(process.cwd(), 'uploads', filename || '');
            if (!fs.existsSync(filePath)) {
                isBroken = true;
            }
        }

        if (isBroken) {
            console.log(`Deleting analysis ${a.id}: ${a.image_name} (${a.image_url})`);
            await prisma.analysis.delete({ where: { id: a.id } });
            deletedCount++;
        } else {
            console.log(`Keeping analysis ${a.id}: ${a.image_name} (Valid local image found)`);
        }
    }
    console.log(`Deleted ${deletedCount} broken analyses.`);
}

clean().catch(console.error).finally(() => prisma.$disconnect());
