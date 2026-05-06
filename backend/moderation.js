const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the current directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Use the cloudinary package (ensure it's installed in the backend or root)
// Since it's likely in backend/node_modules, we can try to require it directly
// or expect the user to run this from the backend. 
// However, for a root script, we'll configure it manually.
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function disableModeration() {
  console.log('--- Cloudinary Moderation Disable Tool ---\n');

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('[ERROR] Cloudinary credentials not found. Make sure backend/.env exists and is correct.');
    return;
  }

  try {
    // 1. Update Upload Presets
    console.log('Step 1: Checking Upload Presets...');
    const presetsResult = await cloudinary.api.upload_presets();
    
    for (const preset of presetsResult.presets) {
      console.log(`Updating preset: ${preset.name}...`);
      await cloudinary.api.update_upload_preset(preset.name, {
        moderation: null,
        quality_analysis: false,
        accessibility_analysis: false,
        cinemagraph_analysis: false
      });
      console.log(`[SUCCESS] Moderation disabled for preset: ${preset.name}`);
    }

    // 2. Handle existing moderated resources
    console.log('\nStep 2: Checking for resources pending moderation...');
    
    // We'll check for images and videos
    const resourceTypes = ['image', 'video'];
    
    for (const type of resourceTypes) {
      let next_cursor = null;
      do {
        const pending = await cloudinary.api.resources({
          resource_type: type,
          moderation_status: 'pending',
          max_results: 500,
          next_cursor: next_cursor
        });

        if (pending.resources.length > 0) {
          const publicIds = pending.resources.map(r => r.public_id);
          console.log(`Found ${publicIds.length} pending ${type} resources. Approving...`);

          // Approve in batches if possible, but the API update often works on individual IDs or via bulk
          for (let i = 0; i < publicIds.length; i++) {
            const publicId = publicIds[i];
            process.stdout.write(`\rApproving: ${i + 1}/${publicIds.length} resources... `);
            
            try {
              await cloudinary.api.update(publicId, {
                moderation_status: 'approved',
                resource_type: type
              });
            } catch (err) {
              if (err.message && err.message.includes('not marked for moderation')) {
                continue;
              }
              throw err;
            }
          }
          console.log(`\n[SUCCESS] Processed ${publicIds.length} ${type} resources.`);
        }
        next_cursor = pending.next_cursor;
      } while (next_cursor);
    }

    console.log('\n=============================================');
    console.log('FINISHED: All moderation settings turned off.');
    console.log('=============================================');

  } catch (error) {
    const errorMsg = error.message || (error.error && error.error.message) || "Unknown error";
    console.error('\n[ERROR] Failed to disable moderation:', errorMsg);
    
    if (errorMsg.toLowerCase().includes('admin api')) {
      console.log('\nTip: Ensure your API Key and Secret have Admin permissions.');
    }
  }
}

disableModeration();

