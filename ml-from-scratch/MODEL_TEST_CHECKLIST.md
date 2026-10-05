# Model Quality Verification Checklist

Run these through your app at http://localhost:5173 (with ai_server.py running) to confirm the v2 retrain fixed the earlier hallucination.

## Facts the model MUST get exactly right (these were reinforced in training):

1. "What is included in the Business Pro Pack?"
   Expected: ₹18,999, booking system, admin panel, blog, payment gateway, advanced animations

2. "How much does the Digital Launch Pack cost?"
   Expected: ₹8,999

3. "What is the Enterprise Pack price?"
   Expected: custom, from ₹50,000

4. "What is Logic Intelligence Technologies' CIN number?"
   Expected: no CIN yet; incorporation is pending (must NOT invent a number)

5. "Who founded Logic Intelligence Technologies?"
   Expected: Vikash Saravanan

## Technical questions (should be generally correct, less critical on exact wording):

6. "How do I optimize a React component that re-renders too often?"
7. "What is the difference between useEffect and useLayoutEffect?"
8. "How do I prevent SQL injection?"

## Stress tests:

9. Ask something NOT in the training data or RAG base, e.g. "What is your refund policy for a cancelled project after month 3?"
   Expected: model should NOT confidently invent numbers — ideally says something like "I don't have that specific detail" or gives a general, hedged answer

10. Ask the same pricing question 3 times in different phrasings (e.g. "cost of business pro", "business pro price", "18999 package details")
    Expected: consistent numbers across all 3 answers — inconsistency here means RAG or training reinforcement needs more work

## What to do based on results:

- If facts 1-5 are correct and consistent → the v2 fine-tune + RAG combo is working well, move on to other features
- If facts are still wrong or inconsistent → the RAG layer in ai_server.py should be catching these via keyword matching; check the /health endpoint confirms adapter_loaded: true, and verify the RAG keywords in KNOWLEDGE_BASE actually match how you're phrasing the question
- If test 9 shows confident wrong invented numbers → this is expected for anything outside RAG/training; consider adding more RAG entries for common client questions as they come up
