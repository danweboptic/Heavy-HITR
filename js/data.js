/**
 * HeavyHITR - Data Module
 * Contains static data for the application
 * @author danweboptic
 * @lastUpdated 2025-03-21 15:11:32
 */

// Workout content by type
export const workoutContent = {
    punching: [
        {
            focus: "Jab-Cross Combinations",
            instruction: "Focus on speed and accuracy with your punches",
            image: "images/punching/jab-cross.png"
        },
        {
            focus: "Hooks and Uppercuts",
            instruction: "Generate power from your hips and shoulders",
            image: "images/punching/hooks-uppercuts.png"
        },
        {
            focus: "Body Shots",
            instruction: "Keep your guard up while targeting the body",
            image: "images/punching/body-shots.png"
        },
        {
            focus: "Speed Combinations",
            instruction: "Quick 3-4 punch combos with snap",
            image: "images/punching/speed-combos.png"
        },
        {
            focus: "Power Shots",
            instruction: "Full rotation for maximum impact",
            image: "images/punching/power-shots.png"
        },
        {
            focus: "Mixed Punching",
            instruction: "Vary your targets and punch types",
            image: "images/punching/mixed-punching.png"
        },
        {
            focus: "Double-Jab Lead",
            instruction: "Two quick jabs followed by power punches",
            image: "images/punching/double-jab.png"
        },
        {
            focus: "Counter Punching",
            instruction: "Defensive slip then counter with combinations",
            image: "images/punching/counter-punch.png"
        }
    ],
    footwork: [
        {
            focus: "Lateral Movement",
            instruction: "Quick side-to-side shuffling around the bag",
            image: "images/footwork/lateral.png"
        },
        {
            focus: "Pivot and Angle",
            instruction: "Create angles by pivoting on front or back foot",
            image: "images/footwork/pivot.png"
        },
        {
            focus: "In and Out",
            instruction: "Attack and retreat with proper distance control",
            image: "images/footwork/in-out.png"
        },
        {
            focus: "Circling",
            instruction: "Move around the bag maintaining stance",
            image: "images/footwork/circling.png"
        },
        {
            focus: "Stance Switching",
            instruction: "Switch between orthodox and southpaw",
            image: "images/footwork/switching.png"
        },
        {
            focus: "Rhythm & Flow",
            instruction: "Maintain constant movement with smooth transitions",
            image: "images/footwork/rhythm.png"
        },
        {
            focus: "Step-Drag Technique",
            instruction: "Lead foot steps, rear foot follows while maintaining stance",
            image: "images/footwork/step-drag.png"
        }
    ],
    defense: [
        {
            focus: "Slipping",
            instruction: "Slip punches left and right with head movement",
            image: "images/defense/slipping.png"
        },
        {
            focus: "Blocking and Parrying",
            instruction: "Use your gloves to block and deflect",
            image: "images/defense/blocking.png"
        },
        {
            focus: "Bobbing and Weaving",
            instruction: "Duck under imaginary hooks with knee bend",
            image: "images/defense/bobbing.png"
        },
        {
            focus: "Pull Counter",
            instruction: "Pull back and counter with straight punches",
            image: "images/defense/pull-counter.png"
        },
        {
            focus: "Full Defense",
            instruction: "Mix all defensive techniques with counters",
            image: "images/defense/full-defense.png"
        },
        {
            focus: "Shell Defense",
            instruction: "High guard protection with subtle movements",
            image: "images/defense/shell.png"
        },
        {
            focus: "Catching & Blocking",
            instruction: "Catch and redirect incoming punches",
            image: "images/defense/catch-block.png"
        }
    ],
    conditioning: [
        {
            focus: "Speed Bursts",
            instruction: "Maximum punches for 20 seconds, then 10 seconds slower",
            image: "images/conditioning/speed-bursts.png"
        },
        {
            focus: "Endurance Drill",
            instruction: "Maintain consistent output for the full round",
            image: "images/conditioning/endurance.png"
        },
        {
            focus: "Power Focus",
            instruction: "Hard shots with full body engagement",
            image: "images/conditioning/power.png"
        },
        {
            focus: "Punch-Out",
            instruction: "Maximum punches with no break",
            image: "images/conditioning/punch-out.png"
        },
        {
            focus: "Active Recovery",
            instruction: "Light movement and easy punches",
            image: "images/conditioning/recovery.png"
        },
        {
            focus: "Explosive Combinations",
            instruction: "Short bursts of maximum effort combinations",
            image: "images/conditioning/explosive.png"
        },
        {
            focus: "Cardio Boxing",
            instruction: "Higher volume, continuous movement, controlled breathing",
            image: "images/conditioning/cardio.png"
        }
    ]
};

// Coach messages by type
export const coachMessages = {
    roundStart: [
        "Let's go! Start strong!",
        "New round! Find your rhythm!",
        "Focus and control this round!",
        "Keep your form tight this round!",
        "Show me your best this round!",
        "Round beginning, stay focused!",
        "Set the pace for this round!",
        "Let's make this round count!"
    ],
    roundEnd: [
        "Great work! Rest up!",
        "Nice round! Take a breather!",
        "Good job! Recover now!",
        "Round complete! Rest and recover!",
        "Well done! Catch your breath!",
        "Excellent effort! Rest period!",
        "Good intensity! Recovery time!",
        "Round finished! Rest and prepare!"
    ],
    encouragement: [
        "Keep it up! You're doing great!",
        "Stay strong! Push through!",
        "That's it! Keep that energy!",
        "Looking sharp! Keep going!",
        "You've got this! Don't slow down!",
        "Excellent form! Maintain it!",
        "Perfect technique! Keep it going!",
        "Strong work! Stay with it!",
        "Great power! Keep pushing!",
        "You're crushing it! Keep the pace!"
    ],
    technique: [
        "Keep your guard up!",
        "Rotate those hips!",
        "Snap those punches!",
        "Stay on the balls of your feet!",
        "Breathe with each punch!",
        "Follow through with your punches!",
        "Keep your chin tucked!",
        "Pivot as you punch!",
        "Maintain proper distance!",
        "Protect your centerline!",
        "Sharp, crisp punches!"
    ],
    breakTime: [
        "Breathe deep and recover",
        "Shake it out and relax",
        "Hydrate if you need to",
        "Mental preparation for next round",
        "Focus on your breathing",
        "Recover and reset",
        "Deep breaths, in through nose, out through mouth",
        "Loose arms, relax your shoulders",
        "Visualize the next round",
        "Controlled breathing, stay focused"
    ],
    countdown: [
        "Get ready! Next round coming up!",
        "Prepare yourself! Round starting soon!",
        "Almost time! Get in position!",
        "Get set! Round starting in seconds!",
        "Ready? Here we go again!"
    ],
    workoutComplete: [
        "Workout complete! Great job!",
        "You crushed it! Workout finished!",
        "Amazing work today! All done!",
        "Workout complete! Feel the burn!",
        "That's a wrap! Well done!",
        "Excellent session! Workout complete!",
        "You smashed it! Session finished!",
        "Great workout! You should be proud!"
    ],
    punchingTechnique: [
        "Rotate your hips on those power shots!",
        "Snap your punches with speed!",
        "Remember to breathe with each combination!",
        "Maintain your guard between punches!",
        "Extend those jabs fully!",
        "Connect with your knuckles properly!",
        "Keep your shoulders relaxed!"
    ],
    footworkTechnique: [
        "Stay light on your feet!",
        "Keep your weight balanced!",
        "Small, controlled steps!",
        "Don't cross your feet!",
        "Pivot on the balls of your feet!",
        "Maintain your stance while moving!"
    ],
    defenseTechnique: [
        "Small head movements!",
        "Keep your eyes on the target!",
        "Return to guard position quickly!",
        "Tight defense, no gaps!",
        "Block and counter immediately!",
        "Keep your core tight while slipping!"
    ],
    conditioningTechnique: [
        "Manage your energy!",
        "Controlled breathing is key!",
        "Push through the burn!",
        "Maintain form even when tired!",
        "Quick recovery between bursts!",
        "Keep up the intensity!"
    ]
};

// Voice coach messages (designed for speech synthesis)
export const voiceCoachMessages = {
    roundStart: [
        "Round {round} of {total}. Begin.",
        "Starting round {round}.",
        "Round {round}, focus on your {type}.",
        "New round. {round} of {total}.",
        "Round {round}. Let's go."
    ],
    roundEnd: [
        "Round complete. Take a break.",
        "Good work. Rest now.",
        "Break time. Recover.",
        "Rest period. Breathe.",
        "Rest now. Prepare for round {next}."
    ],
    encouragementPunching: [
        "Good punching technique.",
        "Keep those punches sharp.",
        "Great power, maintain your form.",
        "Speed and accuracy, you're doing well."
    ],
    encouragementFootwork: [
        "Light on your feet, good movement.",
        "Your footwork is looking good.",
        "Stay balanced and mobile.",
        "Nice pivots, keep moving."
    ],
    encouragementDefense: [
        "Good defensive technique.",
        "Keep that guard up, nice work.",
        "Great head movement.",
        "Stay defensive, good blocking."
    ],
    encouragementConditioning: [
        "Keep pushing, maintain intensity.",
        "Good pace, stay with it.",
        "You're doing well, keep it up.",
        "Strong effort, maintain energy."
    ],
    countdown: [
        "3",
        "2",
        "1"
    ],
    halfwayPoint: [
        "Halfway point.",
        "Halfway done, keep going.",
        "Halfway there."
    ],
    workoutComplete: [
        "Workout complete. Well done.",
        "Session finished. Great work.",
        "Workout complete. You did great.",
        "That's it for today. Good job."
    ]
};

// Exercise library to populate content
export const exerciseLibrary = {
    punching: [
        { id: 'p1', name: 'Jab', difficulty: 'beginner' },
        { id: 'p2', name: 'Cross', difficulty: 'beginner' },
        { id: 'p3', name: 'Hook', difficulty: 'intermediate' },
        { id: 'p4', name: 'Uppercut', difficulty: 'intermediate' },
        { id: 'p5', name: 'Jab-Cross', difficulty: 'beginner' },
        { id: 'p6', name: 'Double Jab-Cross', difficulty: 'intermediate' },
        { id: 'p7', name: 'Jab-Cross-Hook', difficulty: 'intermediate' },
        { id: 'p8', name: 'Jab-Cross-Hook-Cross', difficulty: 'advanced' },
        { id: 'p9', name: 'Body Jab', difficulty: 'beginner' },
        { id: 'p10', name: 'Body Hook', difficulty: 'intermediate' },
        { id: 'p11', name: 'Cross-Hook-Cross', difficulty: 'advanced' },
        { id: 'p12', name: 'Double Hook', difficulty: 'advanced' },
        { id: 'p13', name: 'Jab-Cross-Uppercut', difficulty: 'intermediate' },
        { id: 'p14', name: 'Uppercut-Hook', difficulty: 'advanced' },
        { id: 'p15', name: 'Jab-Body Cross-Hook', difficulty: 'advanced' }
    ],
    footwork: [
        { id: 'f1', name: 'Lateral Movement', difficulty: 'beginner' },
        { id: 'f2', name: 'Forward-Backward Step', difficulty: 'beginner' },
        { id: 'f3', name: 'Pivot Left', difficulty: 'intermediate' },
        { id: 'f4', name: 'Pivot Right', difficulty: 'intermediate' },
        { id: 'f5', name: 'L-Step', difficulty: 'intermediate' },
        { id: 'f6', name: 'Stance Switch', difficulty: 'advanced' },
        { id: 'f7', name: 'Circling Left', difficulty: 'beginner' },
        { id: 'f8', name: 'Circling Right', difficulty: 'beginner' },
        { id: 'f9', name: 'Half-Step Entry', difficulty: 'advanced' },
        { id: 'f10', name: 'Pendulum Step', difficulty: 'advanced' }
    ],
    defense: [
        { id: 'd1', name: 'High Guard Block', difficulty: 'beginner' },
        { id: 'd2', name: 'Slip Left', difficulty: 'beginner' },
        { id: 'd3', name: 'Slip Right', difficulty: 'beginner' },
        { id: 'd4', name: 'Duck', difficulty: 'intermediate' },
        { id: 'd5', name: 'Parry Jab', difficulty: 'intermediate' },
        { id: 'd6', name: 'Parry Cross', difficulty: 'intermediate' },
        { id: 'd7', name: 'Roll Under', difficulty: 'advanced' },
        { id: 'd8', name: 'Pull Counter', difficulty: 'advanced' },
        { id: 'd9', name: 'Catch and Counter', difficulty: 'advanced' },
        { id: 'd10', name: 'Shell Defense', difficulty: 'intermediate' }
    ],
    conditioning: [
        { id: 'c1', name: 'Speed Punches', difficulty: 'beginner' },
        { id: 'c2', name: 'Power Punches', difficulty: 'intermediate' },
        { id: 'c3', name: 'Burn Out Drill', difficulty: 'advanced' },
        { id: 'c4', name: 'Interval Punches', difficulty: 'intermediate' },
        { id: 'c5', name: 'Shuffling Drill', difficulty: 'beginner' },
        { id: 'c6', name: 'Shadow Boxing', difficulty: 'beginner' },
        { id: 'c7', name: 'Fast-Slow-Fast', difficulty: 'intermediate' },
        { id: 'c8', name: 'Pyramid Drill', difficulty: 'advanced' },
        { id: 'c9', name: 'Tabata Punches', difficulty: 'advanced' },
        { id: 'c10', name: 'Active Recovery', difficulty: 'beginner' }
    ]
};

// Achievement system data
export const achievementSystem = {
    workoutCount: [
        { id: 'wc1', name: 'First Session', description: 'Complete your first workout', threshold: 1, icon: 'trophy' },
        { id: 'wc2', name: 'Getting Started', description: 'Complete 5 workouts', threshold: 5, icon: 'fitness' },
        { id: 'wc3', name: 'Regular Boxer', description: 'Complete 20 workouts', threshold: 20, icon: 'boxing-glove' },
        { id: 'wc4', name: 'Committed Fighter', description: 'Complete 50 workouts', threshold: 50, icon: 'medal' },
        { id: 'wc5', name: 'Boxing Expert', description: 'Complete 100 workouts', threshold: 100, icon: 'champion' }
    ],
    streak: [
        { id: 's1', name: 'Two in a Row', description: 'Work out 2 days in a row', threshold: 2, icon: 'flame' },
        { id: 's2', name: 'Strong Week', description: 'Work out 7 days in a row', threshold: 7, icon: 'calendar' },
        { id: 's3', name: 'Dedicated', description: 'Work out 14 days in a row', threshold: 14, icon: 'star' },
        { id: 's4', name: 'Iron Discipline', description: 'Work out 30 days in a row', threshold: 30, icon: 'diamond' }
    ],
    roundCount: [
        { id: 'rc1', name: 'First Rounds', description: 'Complete 10 total rounds', threshold: 10, icon: 'stopwatch' },
        { id: 'rc2', name: 'Going the Distance', description: 'Complete 50 total rounds', threshold: 50, icon: 'rounds' },
        { id: 'rc3', name: 'Round Master', description: 'Complete 200 total rounds', threshold: 200, icon: 'crown' }
    ],
    workoutTime: [
        { id: 'wt1', name: 'First Hour', description: 'Train for a total of 1 hour', threshold: 3600, icon: 'clock' },
        { id: 'wt2', name: 'Dedication', description: 'Train for a total of 5 hours', threshold: 18000, icon: 'hourglass' },
        { id: 'wt3', name: 'Boxing Enthusiast', description: 'Train for a total of 20 hours', threshold: 72000, icon: 'timer' }
    ]
};