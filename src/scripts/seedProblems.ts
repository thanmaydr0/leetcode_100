// ============================================
// AlgoForge — Supabase Problem Seeder
// Run: npx tsx src/scripts/seedProblems.ts
// Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
// ============================================

import { createClient } from '@supabase/supabase-js';
import { problems } from '../data/problems';
import * as dotenv from 'dotenv';

// Load .env.local for service role key
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables.');
    console.error('   Required in .env.local:');
    console.error('     SUPABASE_URL=https://your-project.supabase.co');
    console.error('     SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    process.exit(1);
}

// Service role client bypasses RLS
const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
    console.log('🔧 AlgoForge Problem Seeder');
    console.log(`   Target: ${supabaseUrl}`);
    console.log(`   Problems to seed: ${problems.length}\n`);

    // Transform to match DB schema
    const rows = problems.map((p) => ({
        id: p.id,
        number: p.number,
        title: p.title,
        url: p.url,
        difficulty: p.difficulty,
        category: p.category,
        pattern: p.pattern,
        importance_note: p.importanceNote,
        is_starred: false,
    }));

    // Upsert in batches of 25
    const batchSize = 25;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { data, error } = await supabase
            .from('problems')
            .upsert(batch, { onConflict: 'id' })
            .select();

        if (error) {
            console.error(`   ❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
            errors += batch.length;
        } else {
            inserted += (data?.length || batch.length);
            console.log(`   ✅ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} problems upserted`);
        }
    }

    console.log(`\n📊 Results:`);
    console.log(`   Inserted/Updated: ${inserted}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${problems.length}`);

    if (errors === 0) {
        console.log('\n🎉 All problems seeded successfully!');
    } else {
        console.log('\n⚠️  Some problems failed to seed. Check errors above.');
        process.exit(1);
    }
}

seed().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
