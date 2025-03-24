/**
 * HeavyHITR - Data Module
 * Contains workout content and coach messages
 * @author danweboptic
 * @lastUpdated 2025-03-24 13:36:04
 */

// Workout content organized by workout type
export const workoutContent = {
    striking: [
        {
            focus: "Jab-Cross Combinations",
            instruction: "Focus on extending fully and rotating your hips for power"
        },
        {
            focus: "Hooks and Uppercuts",
            instruction: "Generate power from your legs and core, not just your arms"
        },
        {
            focus: "Body Shots",
            instruction: "Bend your knees and aim for the ribs and solar plexus"
        },
        {
            focus: "Defensive Strikes",
            instruction: "Focus on counter-punching after slipping or blocking"
        },
        {
            focus: "Speed Combinations",
            instruction: "Emphasize quick, snappy punches with proper form"
        },
        {
            focus: "Power Strikes",
            instruction: "Put your weight behind each strike and follow through"
        }
    ],
    footwork: [
        {
            focus: "Lateral Movement",
            instruction: "Stay light on your feet, moving side to side without crossing your feet"
        },
        {
            focus: "Forward and Back",
            instruction: "Practice advancing and retreating while maintaining your stance"
        },
        {
            focus: "Pivoting",
            instruction: "Rotate on the ball of your foot to change direction quickly"
        },
        {
            focus: "Angle Creation",
            instruction: "Step off-center to create advantageous striking angles"
        },
        {
            focus: "Rhythm Changes",
            instruction: "Alternate between slow and explosive movements to be unpredictable"
        }
    ],
    defense: [
        {
            focus: "Blocking",
            instruction: "Keep your hands up and elbows tucked to protect your head and body"
        },
        {
            focus: "Slipping",
            instruction: "Move your head off the centerline to avoid straight punches"
        },
        {
            focus: "Parrying",
            instruction: "Redirect incoming strikes with gentle hand movements"
        },
        {
            focus: "Rolling",
            instruction: "Bend at the knees and waist to let punches flow over your shoulders"
        },
        {
            focus: "Catching and Countering",
            instruction: "Block the strike and immediately return with your own attack"
        }
    ],
    conditioning: [
        {
            focus: "High Intensity Bursts",
            instruction: "Give maximum effort with explosive movements"
        },
        {
            focus: "Endurance Building",
            instruction: "Maintain consistent output throughout the round"
        },
        {
            focus: "Core Stability",
            instruction: "Engage your core during all movements to improve power transfer"
        },
        {
            focus: "Plyometric Movements",
            instruction: "Focus on explosive power and quick transitions"
        },
        {
            focus: "Active Recovery",
            instruction: "Keep moving while controlling your breathing and heart rate"
        }
    ]
};

// Coach messages by type
export const coachMessages = {
    roundStart: [
        "Let's go! Focus on your technique.",
        "New round starting. Stay sharp.",
        "Round starting. Give it your all.",
        "Time to work. Focus and intensity."
    ],
    roundEnd: [
        "Good work! Take a breath.",
        "Round complete. Recover well.",
        "Nice round! Rest up.",
        "Well done. Use this break to recover."
    ],
    breakTime: [
        "Breathe deeply. Shake out your muscles.",
        "Recover smart. Stay loose.",
        "Almost ready for the next round.",
        "Use this time to mentally prepare."
    ],
    countdown: [
        "Get ready!",
        "Prepare yourself!",
        "Here we go!",
        "Next round coming up!"
    ],
    encouragement: [
        "Keep pushing! You've got this!",
        "Stay strong! Don't give up!",
        "Looking good! Keep the intensity!",
        "You're doing great! Maintain your form!"
    ],
    technique: [
        "Focus on your technique!",
        "Power comes from proper form!",
        "Speed and precision!",
        "Stay balanced and controlled!"
    ],
    strikingTechnique: [
        "Rotate your hips for power!",
        "Extend fully on your punches!",
        "Keep your guard up between combinations!",
        "Snap your punches back quickly!"
    ],
    footworkTechnique: [
        "Stay light on your feet!",
        "Don't cross your feet when moving!",
        "Keep your stance balanced!",
        "Move from your center!"
    ],
    defenseTechnique: [
        "Keep your eyes on your opponent!",
        "Small movements are more efficient!",
        "Return to guard position after defending!",
        "Move your head off the centerline!"
    ],
    conditioningTechnique: [
        "Push through the burn!",
        "Maintain your breathing pattern!",
        "Control your tempo!",
        "Quality over quantity!"
    ],
    workoutComplete: [
        "Workout complete! Great job!",
        "You crushed it! Well done!",
        "Excellent work today!",
        "Workout finished! Be proud of yourself!"
    ]
};

export default {
    workoutContent,
    coachMessages
};