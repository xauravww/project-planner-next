const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPDFExport() {
    console.log('🧪 Testing PDF Export API\n');

    try {
        // Find a test project
        const project = await prisma.project.findFirst({
            include: {
                requirements: true,
                architecture: true,
                workflows: true,
                userStories: true,
                techStack: true,
                mockups: true,
            },
        });

        if (!project) {
            console.log('❌ No projects found in database. Creating a test project...');

            // Create a test project
            const testProject = await prisma.project.create({
                data: {
                    name: 'Test PDF Export Project',
                    description: 'A test project for PDF export functionality',
                    userId: 'test-user-id', // This might need to be adjusted based on your auth setup
                },
                include: {
                    requirements: true,
                    architecture: true,
                    workflows: true,
                    userStories: true,
                    techStack: true,
                    mockups: true,
                },
            });

            console.log('✅ Created test project:', testProject.name);
            return;
        }

        console.log('📋 Found project:', project.name);
        console.log('📊 Project stats:');
        console.log('   - Requirements:', project.requirements?.length || 0);
        console.log('   - Architecture:', !!project.architecture);
        console.log('   - Workflows:', project.workflows?.length || 0);
        console.log('   - User Stories:', project.userStories?.length || 0);
        console.log('   - Tech Stack:', !!project.techStack);
        console.log('   - Mockups:', project.mockups?.length || 0);

        // Test the export API (this would require the server to be running)
        console.log('\n🚀 To test the full export flow:');
        console.log('1. Start the dev server: npm run dev');
        console.log('2. Make a POST request to /api/export-pdf with:');
        console.log(`   { "projectId": "${project.id}" }`);
        console.log('3. Monitor progress via GET /api/export-pdf/progress?exportId=<returned-id>');
        console.log('4. Download PDF via POST /api/export-pdf/progress with the exportId');

        console.log('\n✅ Test setup completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPDFExport();