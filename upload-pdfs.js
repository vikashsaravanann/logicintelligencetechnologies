const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    console.error('Error listing buckets:', bucketsError);
    return;
  }
  
  const bucketName = 'resource-pdfs';
  if (!buckets.find(b => b.name === bucketName)) {
    console.log(`Creating bucket ${bucketName}...`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 104857600, // 100MB
    });
    if (createError) {
      console.error('Error creating bucket:', createError);
      return;
    }
  }

  const pdfsDir = path.join(__dirname, 'public/resources');
  const files = fs.readdirSync(pdfsDir).filter(f => f.endsWith('.pdf'));
  
  for (const file of files) {
    const filePath = path.join(pdfsDir, file);
    const content = fs.readFileSync(filePath);
    
    console.log(`Uploading ${file}...`);
    const { error: uploadError } = await supabase.storage.from(bucketName).upload(file, content, {
      contentType: 'application/pdf',
      upsert: true
    });
    
    if (uploadError) {
      console.error(`Error uploading ${file}:`, uploadError);
    } else {
      console.log(`Successfully uploaded ${file}`);
    }
  }
}

main();
