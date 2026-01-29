// DIAGNOSTIC SCRIPT - Run this in browser console (F12)
// This will help identify what's failing

console.log("🔍 DIAGNOSTIC START");

// 1. Check authentication
const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("✅ Session:", session?.user?.id || "NO SESSION");
    return session?.user?.id;
};

// 2. Try to insert a test shift type
const testShiftInsert = async (userId) => {
    if (!userId) {
        console.error("❌ No userId - cannot test insert");
        return;
    }

    console.log("🧪 Testing shift_types insert with user_id:", userId);

    const testShift = {
        name: 'TEST_DIAGNOSTIC',
        color: '#FF0000',
        default_start: '09:00',
        default_end: '17:00',
        default_duration: 480,
        user_id: userId
    };

    const { data, error } = await supabase
        .from('shift_types')
        .insert([testShift])
        .select();

    if (error) {
        console.error("❌ INSERT ERROR:", error);
        console.error("Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
    } else {
        console.log("✅ INSERT SUCCESS:", data);
        // Clean up test data
        await supabase.from('shift_types').delete().eq('name', 'TEST_DIAGNOSTIC');
        console.log("🧹 Test data cleaned up");
    }
};

// 3. Try to insert a test assignment
const testAssignmentInsert = async (userId) => {
    if (!userId) {
        console.error("❌ No userId - cannot test insert");
        return;
    }

    console.log("🧪 Testing days_assignments insert with user_id:", userId);

    const testAssignment = {
        user_id: userId,
        date: '2026-12-31',
        shift_type_id: null,
        note: 'TEST_DIAGNOSTIC'
    };

    const { data, error } = await supabase
        .from('days_assignments')
        .upsert(testAssignment, { onConflict: 'user_id,date' })
        .select();

    if (error) {
        console.error("❌ UPSERT ERROR:", error);
        console.error("Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
        });
    } else {
        console.log("✅ UPSERT SUCCESS:", data);
        // Clean up test data
        await supabase.from('days_assignments').delete().eq('date', '2026-12-31').eq('user_id', userId);
        console.log("🧹 Test data cleaned up");
    }
};

// 4. Check table structure
const checkTableStructure = async () => {
    console.log("🔍 Checking table structure...");

    // This will fail if columns don't exist, which is diagnostic info
    const { data: shifts, error: shiftsError } = await supabase
        .from('shift_types')
        .select('id, name, user_id')
        .limit(1);

    if (shiftsError) {
        console.error("❌ shift_types query error:", shiftsError.message);
    } else {
        console.log("✅ shift_types structure OK");
    }

    const { data: assignments, error: assignmentsError } = await supabase
        .from('days_assignments')
        .select('id, date, user_id')
        .limit(1);

    if (assignmentsError) {
        console.error("❌ days_assignments query error:", assignmentsError.message);
    } else {
        console.log("✅ days_assignments structure OK");
    }
};

// Run all diagnostics
(async () => {
    try {
        const userId = await checkAuth();
        await checkTableStructure();
        await testShiftInsert(userId);
        await testAssignmentInsert(userId);
        console.log("🏁 DIAGNOSTIC COMPLETE");
    } catch (err) {
        console.error("💥 DIAGNOSTIC FAILED:", err);
    }
})();
