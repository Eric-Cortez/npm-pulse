import { gemini20Flash, googleAI } from "@genkit-ai/googleai"; // Importing Gemini AI models and plugins
import { genkit } from "genkit"; // Importing the Genkit library for AI integration
import { getReviewsByPackageId } from "@/src/lib/firebase/firestore.js"; // Importing function to get reviews from Firestore
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp"; // Importing function to get authenticated Firebase app
import { getFirestore } from "firebase/firestore"; // Importing Firestore instance

// Async component to generate a summary of reviews using Gemini AI
export async function GeminiSummary({ packageId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser(); // Getting the authenticated Firebase app for the user
  const reviews = await getReviewsByPackageId(
    // Fetching reviews for the given package ID
    getFirestore(firebaseServerApp), // Passing the Firestore instance
    packageId // Passing the package ID
  );

  const reviewSeparator = "@"; // Defining a separator for joining review texts
  const prompt = ` // Creating a prompt for the AI model
    Based on the following package reviews,
    where each review is separated by a '${reviewSeparator}' character,
    create a one-sentence summary of what people think of the package.

    Here are the reviews: ${reviews.map((review) => review.text).join(reviewSeparator)}
  `;

  try {
    // Starting a try-catch block for error handling
    const GEMINI_KEY =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    self?.__FIREBASE_DEFAULTS__?.secrets?.GEMINI_API_KEY;

    if (!GEMINI_KEY) {
      throw new Error("GEMINI_API_KEY not set in environment");
    }

    const ai = genkit({
      plugins: [googleAI({ apiKey: GEMINI_KEY })],
      model: gemini20Flash,
    });
    const { text } = await ai.generate(prompt); // Generating the summary text using the AI model

    return (
      // Returning the JSX for the summary
      <div className="package__review_summary">
        <p>{text}</p> {/* Displaying the generated summary text */}
        <p>✨ Summarized with Gemini</p> {/* Attribution to Gemini */}
      </div>
    );
  } catch (e) {
    // Catching any errors that occur
    console.error(e); // Logging the error to the console
    return <p>Error summarizing reviews.</p>; // Returning an error message
  }
}

// Component to show a loading skeleton while the summary is being generated
export function GeminiSummarySkeleton() {
  return (
    // Returning the JSX for the skeleton
    <div className="package__review_summary">
      <p>✨ Summarizing reviews with Gemini...</p> {/* Loading message */}
    </div>
  );
}
