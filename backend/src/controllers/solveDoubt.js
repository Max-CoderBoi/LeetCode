// src/controllers/solveDoubt.js

const Groq = require("groq-sdk");

const solveDoubt = async(req, res) => {
    try {
        const {messages, title, description, testCases, startCode} = req.body;
        
        // Validate required fields
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                message: "Messages array is required"
            });
        }

        // Initialize Groq client
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        // Validate and normalize messages
        const normalizedMessages = messages.map((msg, index) => {
            // Ensure each message has role and content
            if (!msg.role || !msg.content) {
                throw new Error(`Message at index ${index} missing role or content`);
            }

            // Normalize role values
            let role = msg.role.toLowerCase();
            
            // Handle different role formats
            if (role === 'model' || role === 'bot' || role === 'ai') {
                role = 'assistant';
            }
            
            // Validate role is one of the accepted values
            if (!['user', 'assistant', 'system'].includes(role)) {
                throw new Error(`Invalid role "${msg.role}" at index ${index}. Must be "user", "assistant", or "system"`);
            }

            return {
                role: role,
                content: msg.content
            };
        });

        // Format messages with system instruction
        const formattedMessages = [
            {
                role: "system",
                content: `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title}
[PROBLEM_DESCRIPTION]: ${description}
[EXAMPLES]: ${testCases}
[startCode]: ${startCode}

## YOUR CAPABILITIES:
1. **Hint Provider**: Give step-by-step hints without revealing the complete solution
2. **Code Reviewer**: Debug and fix code submissions with explanations
3. **Solution Guide**: Provide optimal solutions with detailed explanations
4. **Complexity Analyzer**: Explain time and space complexity trade-offs
5. **Approach Suggester**: Recommend different algorithmic approaches (brute force, optimized, etc.)
6. **Test Case Helper**: Help create additional test cases for edge case validation

## INTERACTION GUIDELINES:

### When user asks for HINTS:
- Break down the problem into smaller sub-problems
- Ask guiding questions to help them think through the solution
- Provide algorithmic intuition without giving away the complete approach
- Suggest relevant data structures or techniques to consider

### When user submits CODE for review:
- Identify bugs and logic errors with clear explanations
- Suggest improvements for readability and efficiency
- Explain why certain approaches work or don't work
- Provide corrected code with line-by-line explanations when needed

### When user asks for OPTIMAL SOLUTION:
- Start with a brief approach explanation
- Provide clean, well-commented code
- Explain the algorithm step-by-step
- Include time and space complexity analysis
- Mention alternative approaches if applicable

### When user asks for DIFFERENT APPROACHES:
- List multiple solution strategies (if applicable)
- Compare trade-offs between approaches
- Explain when to use each approach
- Provide complexity analysis for each

## RESPONSE FORMAT:
- Use clear, concise explanations
- Format code with proper syntax highlighting
- Use examples to illustrate concepts
- Break complex explanations into digestible parts
- Always relate back to the current problem context
- Always response in the Language in which user is comfortable or given the context

## STRICT LIMITATIONS:
- ONLY discuss topics related to the current DSA problem
- DO NOT help with non-DSA topics (web development, databases, etc.)
- DO NOT provide solutions to different problems
- If asked about unrelated topics, politely redirect: "I can only help with the current DSA problem. What specific aspect of this problem would you like assistance with?"

## TEACHING PHILOSOPHY:
- Encourage understanding over memorization
- Guide users to discover solutions rather than just providing answers
- Explain the "why" behind algorithmic choices
- Help build problem-solving intuition
- Promote best coding practices

Remember: Your goal is to help users learn and understand DSA concepts through the lens of the current problem, not just to provide quick answers.
`
            },
            ...normalizedMessages // Use normalized messages
        ];

        console.log('Sending messages to Groq:', JSON.stringify(formattedMessages, null, 2));

        // Call Groq API
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 2048,
            top_p: 1,
            stream: false
        });

        // Extract assistant's response
        const assistantMessage = response.choices[0].message.content;

        res.status(201).json({
            message: assistantMessage
        });
        
        console.log("Response sent successfully");
        
    } catch(err) {
        console.error('Groq API Error:', err);
        
        // Handle specific error types
        if (err.status === 429) {
            return res.status(429).json({
                message: "Rate limit exceeded. Please try again in a moment."
            });
        }
        
        if (err.status === 401) {
            return res.status(500).json({
                message: "API authentication failed. Please check your API key."
            });
        }

        if (err.status === 400) {
            return res.status(400).json({
                message: "Invalid request format",
                error: err.message
            });
        }
        
        res.status(500).json({
            message: "Internal server error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
}

module.exports = solveDoubt;