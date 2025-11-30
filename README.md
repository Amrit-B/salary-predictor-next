Career Insights AI Salary Predictor

Ever wonder what you should really be earning? This app gives you a realistic salary prediction for any job you can think of and then uses AI to give you some solid career advice.

It's built with the Google Gemini API to go beyond simple, static calculators. Instead of a fixed list of jobs, it can figure out a salary model for pretty much anything on the fly.
✨ What It Does

    Predicts Your Salary (for real): Just type in a job title and your years of experience. The app uses AI to figure out a realistic salary range. No more guessing.

    Gives You AI-Powered Career Tips: Once you have your salary, you can ask for career insights. It'll give you a quick rundown of industry trends, skills you should be working on, and what your next career move could be.

    Clean, Modern UI: Built with Next.js and Tailwind CSS, so it's fast, looks good, and works great on your phone.

    Keeps Your Keys Safe: Your Gemini API key is kept secure on the backend. It's never exposed to the browser.

🚀 How It Works

Under the hood, this app has a smart way of getting its data.

    When you type in a job title, the app doesn't just look it up in a list. It sends the title to a secure backend API.

    The backend then asks the Gemini Pro model a specific question: "For a job like 'Underwater Welder', what's a typical starting salary and annual raise?"

    To make sure the answers don't wildly change every time, it tells the AI to be more factual and less "creative" by setting a low temperature.

    The AI gives the backend a starting salary and a yearly raise number.

    The app then uses those two numbers, along with your years of experience, to calculate and show you the final prediction.

🛠️ Get It Running Locally

Want to run it yourself? Here’s how:

1. Clone the repo:

git clone https://github.com/Amrit-B/salary-predictor-next.git
cd salary-predictor-next

2. Install the dependencies:

npm install

3. Set up your environment variables:

Create a file named .env.local in the main project folder and drop in your Google Gemini API key:

GEMINI_API_KEY=YOUR_API_KEY_HERE

4. Start the development server:

npm run dev

Now you can open http://localhost:3000 in your browser and see it in action.
