<div align="center">

# Spring 2026 CSE 120 - Team 335 - Advancing STEM Education via AI-Generated Games

### Team Members

**Ethan Reed** - Team Lead/Coordinator, Full-Stack 
<br>
**Natalie Parker** - Full-Stack, Database Designer
<br>
**Arielle Talania** - Full-Stack, DevOps Engineer, UI/UX Designer
<br>
**Djeinabou Bah** - Team Moderator, Front-End
<br>
**Sergio Gonzalez** - Back-End, Database Designer
<br>

</div>

## Overview

This project focuses on the development of AI-enhanced STEM learning games for students throughout highschool and college, with a focus on integrating real-time physical mobile sensor data into web-develloped gameplay. These games aim to extend beyond the traditional educational simulations to engage students in more sophisticated, hands-on experiences, utilizing the use of AI that applies socratic questioning and tiered hints to ensure students learn intuitively at their own pace.

### Goals

- Create educational games that implement AI to give students a smoother learning process
- Implement features that manipulate physical mobile sensors into web games to allow students to have more interactive experiences
- Use AI integration to personalize student's experiences and help them learn at their own pace

### Features

- [ ] Implementation of AI-Enhanced Learning. Students will recieve subtle help from AI that manages the difficulty scaling and student's concept regocnition.
- [ ] Physical Mobile Sensor Integration. Games will include a feature that allows students to use their physical phone sensor data to manipulate or progress through the game.
- [ ] Showcasing Games Through a Web Portal. Students and Educators will be able to visit a web portal that houses all games created by us.

### Software Stack / Technologies Used

- Language: Javascript, HTML, CSS
- Frontend Frameworks: React, Kaplay.js, Three.js
- Backend Frameworks: Next.js
- Database: 

## Feedback Email Configuration

Feedback submissions are saved to the Supabase `feedback` table with:

- `name`
- `email`
- `answer`
- `features`
- `return_likelihood`
- `comments`

The API also sends a formatted email notification using Resend.

Recommended place to store the destination email:

- Use a Supabase settings table (default: `app_settings`) with:
  - `key = feedback_recipient_email`
  - `value = your-team-inbox@example.com`

This allows developers/admins to change the recipient without redeploying.

Environment variables used by `src/app/api/feedback/route.ts`:

- `RESEND_API_KEY` (required for email sending)
- `FEEDBACK_FROM_EMAIL` (sender address)
- `FEEDBACK_RECIPIENT_EMAIL` (fallback recipient if settings row is missing)
- `FEEDBACK_SETTINGS_KEY` (optional, defaults to `feedback_recipient_email`)
