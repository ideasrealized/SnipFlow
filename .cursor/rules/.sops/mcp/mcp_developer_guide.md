---
description: 
globs: 
alwaysApply: false
---
Model Context Protocol Developer Guide

Model Context Protocol (MCP) is an open standard that defines how AI applications (LLM hosts) communicate with external tools and data sources in a consistent, secure way
modelcontextprotocol.io
. It acts like a “USB-C for AI” – a universal interface so that any AI model can plug into any compliant data source or service
modelcontextprotocol.io
. By using MCP, developers avoid building one-off integrations for each AI app and each tool; instead, they implement a common protocol once. This guide provides a comprehensive overview of MCP’s architecture and layers, along with practical instructions, code examples, and best practices for building MCP servers and clients.
Overview of MCP and Its Purpose
MCP was introduced by Anthropic in late 2024 to standardize how AI assistants access context and perform actions
medium.com
. In modern AI workflows, large language models often need extra information (context) or abilities (tools). MCP addresses this by defining a client-server architecture
modelcontextprotocol.io
medium.com
:
Host: The AI application (e.g. a chat interface, IDE plugin, or custom agent) that uses an LLM and needs external data or functions
medium.com
. The host spawns one or more clients and orchestrates model interactions.
Client: A connector inside the host that manages a 1:1 connection to an MCP server
modelcontextprotocol.io
. Each external capability gets its own client. The client handles communication, session management, and enforces isolation (one client can’t directly access another’s data)
modelcontextprotocol.io
.
Server: A lightweight service that exposes a specific set of data or tools via MCP
modelcontextprotocol.io
. Examples include a filesystem server (for file access), a database server (for queries), or an API wrapper (for external services like Slack or GitHub). Servers focus on one domain and rely on the host/client to handle coordination and security
modelcontextprotocol.io
modelcontextprotocol.io
.


MCP architecture: A host (e.g. Claude Desktop or an IDE) runs multiple MCP clients, each connecting to a different server via the MCP protocol. Servers can interface with local resources (e.g. files) or remote services (e.g. Slack API), giving the AI model standardized access to various tools and data. Purpose of MCP: By introducing a common protocol, MCP makes integrations composable and interchangeable. An AI host can support many tools by simply launching the corresponding MCP servers, without bespoke code for each. Likewise, a tool provider can create one MCP server and have it work with any MCP-compatible AI app
philschmid.de
philschmid.de
. MCP draws inspiration from the Language Server Protocol (LSP) in how it standardizes communication
modelcontextprotocol.io
. In summary, MCP enables:
Context Sharing: Supplying the LLM with fresh data (files, documents, database rows, etc.) on demand
medium.com
.
Tool Use: Allowing the LLM to invoke functions or actions (e.g. send an email, query an API) in a controlled manner
medium.com
.
Workflow Composition: Building complex agent behaviors by combining multiple MCP servers, each adding capabilities to the AI
modelcontextprotocol.io
medium.com
.
Security & Isolation: The host mediates access, so servers only see what they need and cannot read the entire conversation or each other’s data
modelcontextprotocol.io
. Users must grant permission for tools, and sensitive operations can be sandboxed or require explicit authorization.
With this context, let’s break down MCP’s layers and how to implement each.
MCP Transport Layer
The Transport layer is responsible for carrying JSON-RPC messages between client and server, abstracting the underlying communication channel
github.com
. MCP supports multiple transport mechanisms, chiefly:
Standard I/O (Stdio): The server reads/writes JSON-RPC over its stdin/stdout streams. This is ideal for local servers launched as subprocesses by the host
github.com
. It avoids network overhead and is simple to set up (no networking needed).
HTTP + Server-Sent Events (SSE): The server runs as an HTTP service; client requests are sent via HTTP POST, and server-to-client messages (including streaming responses) are sent over an SSE connection
github.com
. This suits remote or separate processes, allowing communication over HTTP.
MCP may also be extended to custom transports (e.g. WebSockets) by implementing the required interface
auth0.com
auth0.com
, but stdio and SSE are the primary built-ins.
Server-Side Setup (Transport Layer)
On the server side, setting up the transport involves initializing a listener for client connections. For an HTTP+SSE transport, the server typically provides two endpoints: one for the SSE stream and one for receiving JSON-RPC POSTs
github.com
. For example, in Node.js using Express:
js
Copy
Edit
const express = require("express");
const { Server, SSEServerTransport } = require("@modelcontextprotocol/server");
const app = express();

// Initialize MCP server with basic info and declared capabilities
const server = new Server({ name: "my-server", version: "1.0.0" }, { capabilities: {} });

// Prepare transport (will be created when SSE client connects)
let transport = null;

// SSE endpoint: client opens an EventSource to this URL
app.get("/sse", (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);  // attach the transport to MCP server
});

// JSON-RPC endpoint: client POSTS requests here
app.post("/messages", (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);  // process incoming JSON-RPC message
  }
});

app.listen(3000);
In this Node example, when a client connects to /sse, we create an SSEServerTransport that knows to use the /messages route for receiving posts. We then call server.connect(transport), which begins the MCP session on that transport. The POST handler simply delegates incoming messages to the transport’s handler, which parses the JSON and passes it to the MCP server logic. This aligns with the specification that SSE uses an HTTP POST for client-to-server communication and a continuous SSE stream for server-to-client
github.com
. For Python implementations (e.g. using FastAPI or Starlette), the pattern is similar. You would set up a GET route that upgrades to an event stream and a POST route for messages. For instance, using Starlette (FastAPI’s core) with the official Python SDK:
py
Copy
Edit
from mcp.server.sse import SseServerTransport
from mcp import Server

app = Server("example-server")
sse_transport = SseServerTransport("/messages")

async def sse_endpoint(scope, receive, send):
    # Upgrade to SSE and get stream handles
    async with sse_transport.connect_sse(scope, receive, send) as streams:
        # Run the MCP server on the established streams (in/out)
        await app.run(streams[0], streams[1], app.create_initialization_options())

async def messages_endpoint(scope, receive, send):
    # Handle JSON-RPC POST message
    await sse_transport.handle_post_message(scope, receive, send)

# In FastAPI or Starlette, include routes:
routes = [
    Route("/sse", endpoint=sse_endpoint),
    Route("/messages", endpoint=messages_endpoint, methods=["POST"])
]
In this Python example, the SseServerTransport manages SSE specifics. The server calls app.run() with the connected streams to start processing MCP messages. Both Node and Python examples illustrate the typical transport wiring: one long-lived SSE channel for events, and a POST handler for requests. For stdio transport, server setup is even simpler: instantiate an StdioServerTransport and call server.connect() on it (the process’s std streams are used automatically)
auth0.com
auth0.com
. This is usually done when the server is started as a child process by the host. Technologies & Libraries: Use web frameworks (Express, FastAPI) to handle HTTP endpoints. The official MCP SDKs (TypeScript, Python, etc.) provide Server and transport classes that abstract JSON-RPC handling
auth0.com
. Under the hood, JSON messages are framed per JSON-RPC 2.0 spec and sent over the chosen channel. If not using an SDK, you can implement this manually by reading/writing JSON lines for stdio or using libraries for SSE (e.g. eventsource in browser or sse-starlette in Python). Security considerations: Always secure the transport layer. If using SSE over a network, implement authentication (e.g. require a token or session cookie for the SSE connection) and validate the Origin of incoming connections
modelcontextprotocol.io
 to prevent unauthorized websites from connecting (DNS rebinding attack mitigation). Bind local servers to localhost if only meant for local use
modelcontextprotocol.io
. Use HTTPS for remote servers to encrypt traffic.
Client-Side Setup (Transport Layer)
On the client (host application) side, setting up the transport means initiating the connection to the server’s endpoints or stdio:
For stdio servers, the host simply spawns the server process and connects the process’s stdin/stdout to the MCP client library.
For HTTP+SSE servers, the client must open an SSE stream and coordinate HTTP requests.
In practice, an MCP client library will handle much of this. For example, using the TypeScript SDK on the client side:
js
Copy
Edit
const client = new Client({ name: "my-client", version: "1.0.0" }, { capabilities: {} });
const transport = new SSEClientTransport(new URL("http://localhost:3000/sse"));
await client.connect(transport);
Here the client creates an SSEClientTransport pointing to the server’s SSE URL, and then connects. The SDK will internally manage the SSE subscription and send any outgoing requests as POSTs to the /messages endpoint (as specified when the server set up the SSE transport)
modelcontextprotocol.io
. If implementing manually, the client would use an EventSource (in a browser or similar SSE client) to receive events, and perform HTTP POST for requests. The JSON-RPC messages themselves are the same regardless of transport. Communication flow: Once connected, the transport layer simply shuttles JSON-RPC messages back and forth:
Client->Server: JSON-RPC request or notification (sent via HTTP POST or stdio write).
Server->Client: JSON-RPC response or notification (sent via SSE event or stdio write).
The transport does not interpret these messages; it only ensures they get delivered reliably and in order
modelcontextprotocol.io
github.com
.
Example: Over SSE, if the client invokes a tool, it will POST a JSON like {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{...}} to /messages. The server’s SSE endpoint will emit an event with the result or error, formatted as a JSON-RPC response. The client’s SSE listener picks that up and routes it to the appropriate handler. In summary, the Transport layer choices boil down to local vs remote communication:
Use stdio for local plugins (fast, no network needed)
claudecode.app
.
Use HTTP+SSE for services (works across network boundaries and allows streaming)
medium.com
.
Either way, JSON-RPC 2.0 is the payload format on the wire
modelcontextprotocol.io
.
MCP Protocol Layer
On top of the transport, the Protocol layer defines the message format and basic interaction patterns. MCP uses JSON-RPC 2.0 for all its messages
modelcontextprotocol.io
. This means each message is a JSON object that is one of:
Request: A call from one side to invoke a method on the other, expecting a response. Contains a jsonrpc field (value "2.0"), an id (to match replies), a method name, and optional params
modelcontextprotocol.io
.
Response: A reply to a request. Must include the same id and either a result (on success) or an error (on failure)
modelcontextprotocol.io
.
Notification: A one-way message that just has a method and params (no response expected, no id field)
modelcontextprotocol.io
.
The MCP protocol layer frames all its operations in terms of JSON-RPC methods and notifications. For example, “list available tools” might be a request with method: "tools/list" and a corresponding result, whereas an asynchronous event like “new data available” could be a notification method. Both client and server can be callers or responders – MCP is bidirectional. The client typically initiates the session and tool calls, while the server may send notifications or request things like user authorization. The protocol layer ensures that each request from one side gets exactly one response from the other (or an error), matching by id.
JSON-RPC Message Structure and Example
MCP does not extend JSON-RPC’s syntax but defines a set of method names and parameters for various actions. All method names are namespaced (often by category). Key categories include resources/*, tools/*, prompts/*, and auth/*. For instance:
resources/get – request to retrieve the content of a resource by URI.
tools/call – request to execute a tool with given arguments.
auth/requestAuthorization – (if supported) request to initiate an auth flow.
A typical JSON-RPC request from client to server might look like:
json
Copy
Edit
{ 
  "jsonrpc": "2.0",
  "id": 42,
  "method": "tools/call",
  "params": { 
    "name": "get_weather", 
    "arguments": { "latitude": 40.7, "longitude": -74.0 } 
  }
}
This would ask the server to run the get_weather tool with the given coordinates. The server would process that and send back a response such as:
json
Copy
Edit
{
  "jsonrpc": "2.0",
  "id": 42,
  "result": {
    "output": "It's 75°F and sunny." 
  }
}
Or if something went wrong, an error:
json
Copy
Edit
{
  "jsonrpc": "2.0",
  "id": 42,
  "error": { "code": -32601, "message": "Method not found" }
}
MCP adopts the standard JSON-RPC error codes like -32601 Method not found, etc., and allows custom error codes < -32000 for application-specific errors
github.com
github.com
. Message types and flows: After the initial handshake (discussed in Session layer), either side can send:
Requests: e.g., client calls tools/call, server might call back to client with auth/authorize (if it needs user approval).
Notifications: e.g., server sends resources/updated (no reply needed), or client sends an abort notification to cancel an operation.
The protocol layer defines how these messages are correlated and handled. In code, an MCP client library typically provides methods to register handlers for incoming requests/notifications and to send requests easily
claudecode.app
claudecode.app
. For example, a client might register a handler for auth/completeAuthorization to handle a server’s auth callback, while a server registers handlers for things like tools/call. Technologies & Libraries: You can use existing JSON-RPC libraries, but the MCP SDKs already incorporate JSON-RPC handling with strong typing (using schemas for params/results). For example, the TypeScript SDK has server.setRequestHandler(schema, handler)
github.com
 to map a method to a handler function, and the Python SDK uses decorators (@app.list_resources() as seen below) for the same
claudecode.app
. These abstract away the low-level JSON parsing. Below is a snippet showing how a server might handle a request at the protocol layer using the MCP TypeScript SDK and similarly in Python:
js
Copy
Edit
// TypeScript server: define handler for a "ListResources" request
server.setRequestHandler(ListResourcesRequestSchema, async (params) => {
  // no params in this request type
  return {
    resources: [
      { uri: "example://resource", name: "Example Resource" }
    ]
  };
});
py
Copy
Edit
# Python server: using decorator to handle list_resources request
@app.list_resources()
async def list_resources() -> list[types.Resource]:
    return [
        types.Resource(uri="example://resource", name="Example Resource")
    ]
]
In both cases, when a client sends a JSON-RPC "method": "resources/list" (for example), the server will invoke these handlers and return the result in a JSON-RPC response. The library takes care of packing the return value into the proper JSON structure. Communication Flow in Protocol Layer: After setup, interactions follow a request-response or notification pattern:
The caller constructs a JSON object with a unique id (if expecting a result) and sends it.
The receiver finds a matching handler for the method. If none, it returns an error (-32601 MethodNotFound)
claudecode.app
.
If a handler runs, it may perform arbitrary actions (read a file, call an API) and then returns a result or throws an error.
The receiver’s MCP framework then sends back a JSON-RPC response with the result or error.
Notifications are simpler: the sender just emits the JSON, and the receiver invokes any registered handler or ignores it (no ack required).
Because JSON-RPC is stateless at the message level, the Protocol layer relies on the Session layer to maintain any needed state (like capabilities negotiation or open context). We’ll cover that next.
MCP Session Layer
The Session layer manages the lifecycle of a connection: initialization handshake, maintaining state, and termination. MCP sessions are stateful – once a client connects to a server, both sides exchange information about their capabilities and hold the session open for ongoing interactions
modelcontextprotocol.io
.
Session Initialization (Handshake)
When a new client-server connection is made (over the transport), an initialize handshake occurs to set up the session parameters. This is a three-step sequence
github.com
github.com
:
Client -> Server (initialize request): The client sends an initialize request containing its protocol version and a list of capabilities it supports
github.com
. Capabilities are feature flags indicating what optional features the client can handle (for example, whether it supports receiving streaming outputs, or certain resource types)
modelcontextprotocol.io
modelcontextprotocol.io
. The request may also include a session ID or other info if resuming a session (commonly, a new session starts fresh).
Server -> Client (initialize response): The server responds with its own supported protocol version and capabilities
github.com
. Both sides now know what features they mutually support. For example, the server might advertise that it provides resources, tools, and requires authorization for certain tools, etc.
Client -> Server (initialized notification): After receiving the server’s response, the client sends an initialized notification to confirm the handshake is complete
github.com
. This is a JSON-RPC notification (no reply expected) just to signal “acknowledged and ready”.
Connection is ready: At this point, both sides consider the session active and can begin normal message exchange
github.com
.
In pseudo-sequence form:
Client -> initialize {version:..., capabilities:...}
Server -> initializeResult {version:..., capabilities:...}
Client -> initialized {} (notification)
Both client and server typically use their MCP SDK to perform this handshake automatically when connect() is called (as seen in client code earlier). For example, the Python client’s session.initialize() will perform these steps under the hood
modelcontextprotocol.io
. Capabilities: This negotiation is crucial. MCP’s design allows servers/clients to implement additional features progressively and advertise them. For instance, if a server implements the sampling capability (letting the client delegate some LLM sampling control), it will list that in its capabilities and the client will then know to expect certain messages related to sampling
modelcontextprotocol.io
modelcontextprotocol.io
. If a feature isn’t in both lists, it won’t be used during that session. Always ensure the capability lists are accurate. The base protocol itself is considered a capability (with a version) that must match or be compatible. From a developer perspective, during server initialization you typically configure and declare capabilities. For example, using the TS SDK:
js
Copy
Edit
const server = new Server({ name: "my-server", version: "1.0.0" }, {
  capabilities: {
    resources: {},   // support resource retrieval
    tools: {},       // support tool invocation
    // prompts: {}    // (if supporting prompts)
    // other capabilities like auth or streaming flags...
  }
});
Likewise on the client side, you declare what you can handle. The SDKs usually fill this with sensible defaults or given options. 

MCP client-server session: The host’s MCP client and the server establish a session via either stdio or SSE (transport layer). After the handshake, the server can offer Tools, Resources, Prompts to the client. The client (and its LLM) can then invoke those tools or fetch resources. External APIs (Weather API, email service, database, etc.) are accessed by the server as needed to fulfill requests. The session layer ensures both sides track the conversation context if needed. Notably:
The host usually retains the conversation history with the LLM and inserts fetched resources or tool results into the prompt (the server doesn’t see full conversation)
modelcontextprotocol.io
.
The server might maintain state like cached data, subscriptions (if client subscribed to resource updates), or in-progress operations tied to the session. It can use the session context to manage these.
Each session is typically bound to a single user or purpose. If the host opens multiple sessions (e.g., one per document or one per user chat), they are isolated.
Ongoing Session Management
After initialization, the session layer doesn’t require much developer intervention for basic cases – it mainly operates via the protocol’s requests and notifications. However, there are some aspects to be aware of:
Keep-alive/Heartbeat: MCP does not mandate a heartbeat, but if using long-lived SSE, ensure the connection remains alive (some SSE implementations send comments or ping events). The session ends if the transport disconnects.
Subscriptions: If the server offers subscription capabilities (e.g. pushing events when a resource changes), the session will manage those. The client might call a subscribe method and the server will send notifications until unsubscribed or session ends.
Concurrency: MCP allows interleaving requests (JSON-RPC 2.0 supports concurrent calls distinguished by id). The session layer (especially in SDKs) might queue or handle thread-safety. As a developer, if not using the SDK, you should ensure thread-safe handling of messages if the transport can deliver them concurrently.
Session Termination: Either side can close the session. For example, the client might send a shutdown or simply close the connection (stdin EOF or closing SSE). The server should then clean up. A graceful shutdown might involve a specific JSON-RPC notification or method (some implementations use an exit or close notification)
github.com
. Ensure to handle partial operations if a session terminates unexpectedly.
Server-side session management: This includes tracking any per-session state (like auth tokens granted, see next section) and releasing resources when the session closes. If your server is stateless (each request independent), you might not need to track much. But if, say, a login happens in session, you’d store that in a session context object. Client-side session management: The host application might expose UI elements for each connected server (e.g. showing what tools are available from that server). When a session starts, the host could list available tools and resources (by calling methods like tools/list, resources/list) to populate its UI or internal knowledge
medium.com
. Over the session, the host might also handle user preferences, like disabling a tool or revoking access, which could translate to the client instructing the server accordingly. In summary, the Session layer is about establishing a shared understanding (capabilities, state) and keeping the link alive and orderly. With that in place, developers mostly interact with the Application layer – the actual functionality delivered via MCP.
MCP Application Layer
The Application layer encompasses the functional capabilities provided through MCP. This is where the real work happens – using the protocol to do things like reading data or executing an action. MCP defines three primary categories of application-layer features (often called “capabilities” or “primitives”):
Resources: Read-only data that the server can provide (like files, database entries, documents)
medium.com
. Resources are identified by URIs and can be listed or fetched. They supply context to the LLM (e.g. the text of a file to answer a question).
Tools: Operations or functions the server can perform on request
medium.com
. Tools often have side effects or perform computations (e.g. send a message, run a calculation). They enable the LLM to act as an agent that can affect external systems
medium.com
.
Prompts: Predefined prompt templates or guidance that the server offers to help shape the conversation or tool usage
medium.com
. For instance, a server might have a prompt template for a complex SQL query, or a step-by-step workflow guide.
Most servers implement a subset of these. For example, a GitHub server might expose tools (to create an issue, comment, etc.) and resources (to read repository data), while a local filesystem server might primarily expose resources (file contents).
Server-Side (Implementing Application Logic)
On the server side, implementing the application layer means writing the logic behind the JSON-RPC methods for resources, tools, and prompts. Using the MCP server SDK (if available) simplifies this:
Resources: Typically, a server will implement handlers for methods like resources/list (return a list of available resources, perhaps as URIs with names) and resources/read or resources/get (return the content of a specified resource URI). You map these to your data source. For example, a filesystem server’s resources/get would open the file and return its text content.
Tools: You define each tool with an interface (name, input schema, description) and implement the execution. In code, this could be as simple as writing a function and registering it. When the server receives a tools/call request with that tool’s name, it calls your function. For instance, a “sendEmail” tool might correspond to a Python function that sends an email via SMTP and returns a status.
Prompts: If supported, you might have predefined prompt texts or formats. A prompt could be returned when the client calls something like prompts/list or prompts/get. This might be less code-centric and more about storing prompt strings.
If not using an official SDK, you’ll need to establish a convention for methods and implement a dispatcher. The spec defines method naming: for example, tool-related methods are often under a tools/ namespace. Common methods include tools/list (client asks server for all available tools and their schemas)
medium.com
, and tools/call (invoke a specific tool)
medium.com
. The server should handle these appropriately:
tools/list: Return an array of tools with metadata (each tool’s name, description, input fields/types, etc.). This allows the client (and ultimately the LLM) to know what it can do. The server might hardcode this list or generate it if tools are dynamic.
tools/call: Execute the requested tool. The params typically include the tool name and an arguments object. The server should validate the name and input, perform the action, and then return results or an error.
For example, consider a Weather server. It could define a tool get_weather(lat, lon):
tools/list returns something like: [ { "name": "get_weather", "description": "Get weather for coordinates", "parameters": { "lat": "number", "lon": "number" } } ].
When a tools/call comes with {name: "get_weather", arguments: {"lat": 40.7, "lon": -74.0}}, the server calls the weather API and responds with {"temperature":75,"conditions":"sunny"} or similar.
Client-Server communication flow (tool example):
Discovery: Client may call tools/list after init. Server returns available tools
medium.com
.
Invocation: When the LLM (via the client) decides to use a tool, the client sends tools/call
medium.com
.
Execution: Server receives the request, runs the tool logic, possibly making external API calls or database queries.
Response: Server sends back a response with the results (or error). The client then delivers that info to the LLM or user.
The same pattern applies for resources:
Client calls resources/list to see what resource URIs exist (server might list file paths or IDs).
Client calls resources/get (or read) with a URI to retrieve content.
Server returns the content (often chunked or streamed if large, though streaming can be handled via multiple events or a large single response).
Prompts: The client might call prompts/list to get a list of named prompt templates. If the user chooses one or the context requires it, the client might fetch it and use it to prepend or shape the conversation.
Client-Side (Using the Exposed Capabilities)
On the client (host) side, the Application layer’s focus is to leverage the server’s capabilities for the user/LLM. The client doesn’t implement the functionality, but it needs to:
Understand what the server offers (via the listing methods).
Possibly present choices to the user (e.g. show a list of available resources or tools in a UI).
When instructed by the LLM or user, call the appropriate JSON-RPC methods on the server.
Handle responses and feed the results into the LLM’s context or back to the user.
For example, if the LLM asks for a file, the host’s client will call resources/get on the server and then include the returned file content in the prompt it builds for the model. If the LLM “calls” a tool (imagine the model output indicating a function call), the host recognizes it and sends a tools/call request. In this way, the client mediates between the model and the server’s functions. MCP is often used in an AI agent loop:
Model: “I need data X” or “I will use Tool Y”.
Host/Client: calls MCP server for that data or executes that tool.
Server: returns data or result.
Host: inserts result into model’s next prompt or returns to user.
Throughout, the Application layer protocol (the specific JSON-RPC methods) defines the “language” they speak. Here’s a brief example interaction to illustrate the flow:
User query (to AI): “Summarize the latest sales from our database.”
LLM (to client): (thinks it needs data, perhaps it has been prompted that a “database” tool is available)
Client -> Server: tools/call with name: "run_query", arguments: {"sql": "SELECT * FROM sales ORDER BY date DESC LIMIT 100"}.
Server (Database) -> runs the query and returns results (perhaps a summary or the raw data).
Server -> Client: Response with query results (or a resource URI if large).
Client: Inserts the result (or part of it) into the conversation context for the LLM.
LLM: Produces an answer using that data.
User: Sees the answer, possibly with a citation that it came from the database.
From a developer perspective on the client side, much of this is handled by the host application or MCP client library. If you’re writing a host, you will wire up the triggers: e.g., intercept model outputs that look like tool calls and translate them to MCP requests. You might also implement guardrails (require user confirmation before executing certain tools) – MCP provides a standard for that via an auth flow which we’ll cover next.
Technologies & Libraries (Application Layer)
On the server: Use the appropriate SDK to define your tools/resources. For Node/TS, the @modelcontextprotocol/server package allows defining handlers and tool schemas. For Python, the mcp library (if using FastAPI, you might integrate it with your web app logic). Even without an SDK, you can structure your server similarly to an RPC service: maintain a registry of methods and their handlers.
On the client: The host application likely uses an MCP client SDK that gives a high-level API to call methods and subscribe to notifications. For example, a client SDK might have client.request("tools/call", params) which returns a promise of the result. In a custom implementation, you might just send JSON via the transport and wait for the matching response id.
Data formats: Tools and resources often have to serialize/deserialize data. Use JSON for results that the LLM will see (since it ultimately goes into a prompt or answer). Keep results concise and parseable. For complex data, consider returning a summarized version or a reference (like a resource URI) that the client can fetch if needed.
Next, we address authentication and authorization in MCP, which often comes into play when tools need access to third-party accounts or sensitive user data.
Handling Third-Party App Authentication
Many MCP servers act as bridges to third-party services (e.g. Gmail, GitHub, Slack). In those cases, the server often needs an access token to act on the user’s behalf. MCP includes a standardized way to handle an OAuth2 authorization flow between the client (on behalf of the user), the MCP server, and the external service
auth0.com
auth0.com
. This ensures the user explicitly grants permission and tokens are exchanged securely, rather than embedding credentials in prompts. There are two distinct authentication aspects in MCP:
Client-Server AuthN/Z: authenticating the user or host to the MCP server (ensuring only authorized hosts connect). This might be handled out-of-band (e.g. ToolHive’s JWT middleware
dev.to
dev.to
) or via a simple token the host passes when connecting. We won’t focus on this, as it’s often deployment-specific.
Third-Party App OAuth: authorizing the MCP server to access an external API on behalf of the user. This is our focus, as it involves a defined MCP protocol sequence.
OAuth 2.0 Server-Side Setup (Acting as OAuth Client)
From the server’s perspective, to integrate with a third-party API (say Google Drive), you need to set up an OAuth 2 flow:
Register an app with the third-party (e.g. obtain a client ID/secret and allowed redirect URI).
Configure your MCP server with those credentials (securely, e.g. via environment variables).
Implement endpoints to handle OAuth callbacks (the server will receive the redirect with an authorization code).
The MCP spec (as of 2025) moved towards OAuth 2.1 and mandates using PKCE (Proof Key for Code Exchange) for enhanced security
auth0.com
. So your server should generate a PKCE code verifier/challenge at the start of the flow. Server workflow:
Authorization Request: When the client initiates auth (via an MCP method), the server creates an OAuth authorization URL. This includes client_id, requested scopes, redirect_uri (pointing to a server callback endpoint), a generated PKCE challenge, and a state (to guard against CSRF).
The server might store the PKCE verifier and state in the session context for later verification.
Provide URL to Client: The server needs to get this URL to the user’s browser. In MCP, this is done by the server sending either a response or a special notification to the client containing the authorization URL (and perhaps instructions).
Callback Endpoint: Meanwhile, the server must have an HTTP endpoint (e.g. /oauth/callback) that the third-party will redirect to after user consent. When hit, this endpoint will receive the code (and the state). The server verifies the state and then performs a token exchange – i.e., makes a POST to the third-party token endpoint with the authorization code, client credentials, and the PKCE verifier.
If successful, the third-party returns an access token (and possibly a refresh token). The server should securely store this token, tied to the user/session.
The server now has the credentials to access the third-party API. But we also need to inform the MCP client that auth is complete.
Optionally, the MCP spec suggests the server then generates its own MCP access token to represent this authorized session
auth0.com
. Essentially, the server becomes an OAuth provider for the client: after getting the third-party token, it issues a token (or code) that the client will use for subsequent requests. This prevents the client from ever seeing the third-party token directly, adding an extra security layer. In practice, some implementations skip issuing a separate token and just mark the session as authorized internally. JSON-RPC Methods (auth.*): MCP defines a set of methods for driving this flow:
auth/requestAuthorization – invoked by the client to start the OAuth process for a given service or scope. The server responds (or notifies) with information like an authorization URL.
auth/completeAuthorization – used to finalize the process. Depending on design, this could be called by the client with an interim code or could be a server->client callback.
Let’s align this with the OAuth steps:
The client calls auth/requestAuthorization (perhaps with params indicating which service or any options).
Server handling: It prepares the auth URL (step 1 above). How to return it? There are two patterns:
a. Immediate response: Server responds to auth/requestAuthorization with a result containing something like { "authorizationUrl": "https://accounts.google.com/o/oauth2/auth?...", "codeChallenge": "...", "state": "..." }. The client then can use this info.
b. Out-of-band + polling: Server might respond simply with { "status": "pending" } and separately send a notification or wait for client to poll. But the simpler approach is (a).
Now, the host application receives the URL. Client-side, it should open this URL in the user’s browser. This could be done automatically (if the host is a desktop app, open default browser) or by prompting the user to click a link. The user will log in and consent on the third-party site.
Third-party redirects to server’s callback endpoint with ?code=XYZ. The server’s web handler for this will capture the code. (This is outside the JSON-RPC channel – it’s an HTTP request to the server’s web service.)
Server exchanges the code for a token (using stored client_secret, etc.) and gets the access token.
Now server has credentials. It likely also created an MCP session token if using the OAuth2.1 spec for client. Perhaps it generates a random “MCP auth code” or token.
Completing via MCP: The server can now inform the client that authorization succeeded. If using the spec’s full flow, the server would redirect the user’s browser one more time, this time back to the MCP client. For example, the server could redirect to a custom URI scheme that the host app registers (like myapp://auth-complete?code=someMCPcode). If that’s set up, the host application catches that and obtains the MCP auth code. The host then calls auth/completeAuthorization on the MCP channel, supplying that code.
The server verifies the code and responds with an authComplete result (which might include an MCP access token or just confirmation). At this point, the client knows the server is authorized.
If not implementing the full redirect to client, a simpler approach:
After the server gets the third-party token, it could directly send a JSON-RPC notification to the client like auth/authorizationCompleted (non-standard example) or even a response to the original request if it was held open (though holding a JSON-RPC request open is not typical and might block other messages).
Many implementations simply rely on the user seeing “Authorized, you can close this window” and the host polling the server. But the spec’s approach is to use a code exchange so it’s robust and more secure
auth0.com
.
For clarity, here’s the high-level end-to-end flow with the key steps and who does what (from the Auth0 reference): 

Third-Party OAuth Authorization flow in MCP: The MCP Client (host side) initiates an OAuth flow with the MCP Server, which delegates to an external Identity Provider (Auth0 in this diagram)
auth0.com
. The steps are: (1) Client calls auth request; (2) Server provides/redirects to third-party authorization; (3) User approves access on third-party; (4) Third-party redirects back to server with a code; (5) Server exchanges code for token (gets third-party token); (6) Server issues its own token tied to that session; (7) Server informs client (either via redirect or direct message) and the client completes the flow
auth0.com
. After this, the MCP server can use the obtained token to perform API calls, and the client knows the server is authenticated.
Client-Side Setup for User Authorization
On the client (host) side, you need to facilitate the user interaction:
When your MCP server indicates it needs authorization (e.g., maybe the server sent an error like “Unauthorized” when you tried a tool, or more directly the server has a capability flag indicating OAuth is needed), you would call auth/requestAuthorization. Alternatively, the host UI could have a “Connect [Service]” button that triggers it.
Once you receive the authorization URL from the server, open it in the user’s browser. In desktop apps, you might use an API call to open a web page. In a web-hosted scenario (if the host is a web app, which is less common for MCP), you might pop up a new window or direct the user.
The user will complete the login/consent on that page. The client should be prepared to detect when auth is finished. If using a custom URL scheme or loopback address for redirect, the host app might receive the final callback (for example, some apps start a temporary local HTTP server to catch the redirect). For instance, the host might listen on http://localhost:<port>/auth-callback and include that as the redirect URI in the initial URL (this is one approach for device apps).
When the host catches the final redirect (with the MCP auth code perhaps), it should extract the code (or token) and then call auth/completeAuthorization via JSON-RPC to the server, sending that code. This lets the server finalize and verify.
After completion, the host can proceed to use the server’s tools normally. The server should now treat the session as authorized – meaning it will not ask again for this user (perhaps storing a session token or cookie). The host might also store an indication that “Service X is connected”.
If the server issued an MCP access token for the client to use on future calls, the client should include it in requests. This could be done by an HTTP header or as part of the JSON-RPC params (depending on spec specifics). However, the current spec tends to assume the session is authorized without requiring the client to attach the token to every request (since it’s the same session). For multi-session or long-lived credentials, the client might persist the token and reconnect with it next time (to avoid full OAuth each run). JSON-RPC methods on client side: auth.requestAuthorization is a request the client sends; auth.completeAuthorization is another the client sends, likely with a parameter like the code it got. The server may also send notifications like auth.authorizationStatus updates (in some designs, to inform the client of intermediate states).
JSON-RPC Auth Methods and Example Flow
To make this concrete, consider a scenario: an MCP server that provides access to a user’s Google Calendar (to list events). The server requires OAuth to Google.
The host tries to call tools/call for “list_events”. Server responds with an error indicating no valid credentials, or perhaps a custom error code like 401 Unauthorized.
The host then calls auth/requestAuthorization with params {service: "google_calendar"}.
Server handling auth/requestAuthorization:
It generates a PKCE verifier & challenge.
Constructs the Google auth URL with its client_id, redirect_uri, scopes (e.g. read calendar), state, and PKCE challenge.
Stores the PKCE and state in a temp store (session).
Responds to the JSON-RPC request with { "authUrl": "<GoogleAuthURL>" } (and maybe an indication if further action needed).
Host receives this result. It launches the user’s browser to <GoogleAuthURL>.
User logs in to Google, approves access to Calendar.
Google redirects to the server’s callback: e.g. http://localhost:3000/oauth/callback?code=abcd&state=xyz.
Server’s /oauth/callback sees code=abcd. It verifies state=xyz matches what was sent. It finds the PKCE verifier for this session. Then it calls Google’s token endpoint: exchanging code + verifier for tokens. Google returns access_token=TOKEN123 (and maybe refresh_token=REFRESH123).
Server stores these tokens (preferably encrypted on disk or memory).
Now server can mark this session or user as authenticated. Suppose it generates a random authSessionId or token to represent this authenticated link.
The server might not have a direct way to notify the host via JSON-RPC here (since the callback came via HTTP asynchronously). A robust approach: the server triggers a redirect to the host’s callback. If our host set up one (maybe it passed a clientCallbackUrl in the initial request or the server knows to use a default like http://localhost:port/done). Alternatively, the server can hold the auth/requestAuthorization call open until now and then respond (but that’s not how JSON-RPC usually works; better to respond earlier with the URL).
Let’s assume the server did the simpler thing: responded immediately with URL. Then how to tell the host now that we have tokens? One approach is the host polls the server via another JSON-RPC call, like auth/checkAuthorizationStatus periodically. But that’s clunky.
The spec approach: server issues an MCP auth code and redirects the user’s browser to a URL that reaches the host. For example, server could redirect to http://localhost:PORT/authorized?code=MCPCODE123. The host (running at that port) gets this request and extracts MCPCODE123. Now the host calls auth/completeAuthorization with {"code": "MCPCODE123"}.
Server receives auth/completeAuthorization. It verifies MCPCODE123 (likely it maps to the stored session where we have TOKEN123). It then replies with a result like { "status": "authorized" } (or possibly an MCP access token if the client will need it for future sessions).
Now both sides know authorization succeeded. The host can proceed to call tools/call list_events again, and this time the server finds a token and succeeds, returning the events.
This flow involves quite a few steps, but MCP’s specification aims to standardize it so developers don’t have to invent it each time. In practice, using libraries greatly eases this:
Use OAuth 2 client libraries (e.g. Authlib in Python, or simple-oauth2 in Node) to handle URL generation and token exchange. They handle details like encoding PKCE and making the POST request for token.
The MCP SDK may provide helpers. Check if the SDK has an auth module – some might let you register an auth handler and they do some of the heavy lifting.
Testing: do a dry run with a known OAuth provider (Auth0 or a test app) to ensure your redirect flows work.
Best Practices for Secure Token Handling
Handling OAuth flows introduces security concerns. Here are some best practices:
Never expose third-party tokens to the LLM or user via MCP messages. The server should keep access tokens secret. If the spec requires an MCP-issued token for the client, ensure that token is scoped only to your service (e.g., a random session ID, not the actual Google token).
Use PKCE for all authorization code flows (as mandated by MCP spec OAuth 2.1)
auth0.com
. This protects against interception of the auth code.
Validate all callbacks: Check the state parameter on the callback to prevent CSRF. Also ensure the host name of the callback is correct (to avoid a malicious OAuth client impersonating).
Store tokens securely: If your server needs to persist a refresh token (to get new access tokens later), encrypt it at rest. If it’s just in memory for the session, at least ensure it’s not logged or exposed.
Token scope: Request the minimal OAuth scopes needed for the tool. This principle of least privilege limits risk.
Expiration and refresh: Handle token expiration gracefully. Many tokens last an hour. If a token expires, the next tool call might fail with 401 from the API – in that case, use the refresh token to get a new one (if you have it), or require the user to re-auth. It’s good to implement refresh logic on the server side.
User feedback: Provide clear UI cues in the host. For example, show “Not connected” vs “Connected as [User]” for a service. And if not connected, prompt the user to authorize when they try to use it.
Revoke tokens on logout: If your host has a concept of user logout or session end, consider telling the server to revoke the third-party token (some APIs have a revocation endpoint). At least, discard it.
Use TLS: If your MCP server is remote, ensure the OAuth callback and token requests are over HTTPS. Also, the initial auth URL should be HTTPS (which it will be for any major IdP).
Dynamic Client Registration (DCR): The MCP spec mentions dynamic client registration
auth0.com
 – allowing an MCP client to register with the server’s IdP on the fly. This is advanced and not always needed, but if you design your own auth server, it can ease onboarding. Otherwise, manual registration of clients might be fine in controlled environments.
JSON-RPC Auth Methods Summary
Just to consolidate the method semantics:
auth/requestAuthorization (Client -> Server): Begin OAuth flow for a tool/service. Params might include service identifier or scopes. The server usually responds with an URL or instruction (or possibly triggers an external action).
auth/completeAuthorization (Client -> Server): Finalize the auth. Typically called after the host receives some code or token indicating the user has authorized. After this, the server knows the user is authorized and can proceed.
auth/checkAuthorization (Client -> Server) or auth/status (Server -> Client notification): (Not necessarily in spec, but conceptually) could be used to check if already authorized or get status updates. Some servers might implement a way to query if the user is already logged in.
The exact method names might differ (some implementations might use auth/authorize and auth/confirm etc.). Always refer to the latest MCP spec or server docs for the exact RPC method names and payloads expected.
Code Snippet: OAuth Flow Integration
Below is a simplified Python pseudo-code for an MCP server integrating an OAuth flow (using FastAPI for web endpoints and a hypothetical MCP server instance):
py
Copy
Edit
from fastapi import FastAPI, Request
from authlib.integrations.requests_client import OAuth2Session

app = FastAPI()
mcp_server = Server("calendar-server", capabilities={ "tools": {}, "auth": {} })

OAUTH_CLIENT_ID = "<client-id>"
OAUTH_CLIENT_SECRET = "<client-secret>"
REDIRECT_URI = "http://localhost:8000/oauth/callback"
AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"

# In-memory storage for pending auth (state -> PKCE and session reference)
pending_auth = {}

@mcp_server.rpc_method("auth/requestAuthorization")
async def handle_auth_request(params):
    # Generate state and PKCE challenge
    state = secrets.token_urlsafe(16)
    oauth = OAuth2Session(OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, scope="https://www.googleapis.com/auth/calendar.readonly", redirect_uri=REDIRECT_URI)
    code_verifier = OAuth2Session.generate_code_verifier(128)
    code_challenge = OAuth2Session.generate_code_challenge(code_verifier)
    # Construct auth URL
    auth_url = oauth.create_authorization_url(AUTHORIZATION_URL, state=state, code_challenge=code_challenge, code_challenge_method="S256")[0]
    # Store verifier to exchange later
    pending_auth[state] = { "verifier": code_verifier, "session": mcp_server.current_session }
    return { "authorizationUrl": auth_url }

@app.get("/oauth/callback")
async def oauth_callback(request: Request):
    # Get code and state from query
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    if not code or state not in pending_auth:
        return "Invalid state"
    # Exchange code for token
    oauth = OAuth2Session(OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, redirect_uri=REDIRECT_URI)
    token = oauth.fetch_token(TOKEN_URL, code=code, code_verifier=pending_auth[state]["verifier"])
    # Save token to session (in practice, encrypt or securely store if needed)
    session = pending_auth[state]["session"]
    session.token = token  # attach token to MCP session context
    # Optionally, generate an MCP auth code and return it to user agent
    mcp_code = secrets.token_urlsafe(16)
    session.auth_code = mcp_code
    # (You would need to store mcp_code mapped to session to verify later)
    # Redirect user back to the client (assuming client can catch this)
    return HTMLResponse(f"<html><body>Authorized. You can close this window.</body></html>")

@mcp_server.rpc_method("auth/completeAuthorization")
async def handle_auth_complete(params):
    # Client provides an MCP auth code to complete auth
    code = params.get("code")
    session = mcp_server.current_session
    if code and session.auth_code == code:
        session.authorized = True
        return { "status": "authorized" }
    else:
        raise MCPError(code=1, message="Invalid authorization code")
In this pseudo-code:
We use authlib to manage OAuth details. We generate a PKCE code challenge and the Google auth URL.
pending_auth holds the PKCE verifier and a reference to the MCP session (so we know where to store the token later) keyed by state.
When /oauth/callback is hit, we retrieve the token and attach it to the corresponding session.
We generate an mcp_code and store it in the session (as auth_code). Then we instruct the user they can close the window (in a real app, we might redirect to a custom URL or just rely on the user closing it).
In auth/completeAuthorization, the client sends back that mcp_code. We verify it matches and mark the session authorized.
This is a lot of moving parts, but the result is that the server now has session.token which it can use whenever the user calls a tool that needs Google Calendar data. For example, when the client calls our tools/list_events, the handler can use session.token to call Google’s Calendar API and return events. Encryption & Storage: In the above, we stored the token in memory. If the server needs to remember it beyond the session (for reuse later), it should save it in a secure store, encrypted with a key. For example, encrypt the token with a key derived from a server secret before writing to a database or file. Timeouts: OAuth flows can take time if user delays. You might implement a timeout for pending_auth entries – if not completed in, say, 5 minutes, allow the user to retry and clear stale entries. With authentication in place, your MCP server can safely access third-party APIs without the user’s credentials ever being directly exposed to the LLM or transmitted in plaintext through the client. The user remains in control of granting and revoking that access.
Visual Diagrams and Workflow Summary
To wrap up, here’s a summary of the major flows with diagrams for clarity:
General MCP Data Flow: An MCP Host (LLM application) contains MCP Clients that each connect to an external Server via the MCP protocol. The transport (stdio or SSE) carries JSON-RPC messages. The client and server perform an init handshake, then the host can request Resources or call Tools on the server. The server fetches data or performs actions (possibly calling external APIs or local resources) and returns results, which the host integrates into the LLM’s context or output.
Session Initialization Flow: (See the handshake steps above.) The client and server exchange an initialize request/response and an initialized notification
claudecode.app
claudecode.app
. After this, both know each other’s capabilities and the session is ready for use. This ensures, for example, that if the server can send certain notifications (like streaming partial results or auth requests), the client has indicated it can handle them. If not, the server would refrain from using those features or might have failed the handshake due to incompatibility.
Third-Party Authentication Flow: (Refer to the OAuth flow diagram above.) The client initiates an OAuth authorization, the server redirects the user to the third-party service, the user approves access, and the server obtains a token
auth0.com
. The server then finalizes the process with the client so both know the server is now authorized. All sensitive tokens stay on the server, and the client just gets a success confirmation.
By following this guide, developers can implement MCP servers that are robust and integrate seamlessly with AI applications. MCP’s layered approach (Transport, Protocol, Session, Application) helps structure your implementation:
Use the Transport layer appropriate for your deployment.
Leverage the Protocol layer’s JSON-RPC messages to define clear interfaces.
Don’t skip the Session handshake – it’s there to future-proof and negotiate features.
Build out the Application layer (tools/resources) to actually do the job your server is meant for.
If external auth is needed, follow the OAuth patterns to keep it secure and user-consented.
With MCP, an AI assistant could one moment read files from a local drive, the next call an API to get live data, all through a unified protocol. This guide should equip you to create both servers and clients to take advantage of that power. Happy building! Sources:
MCP Official Specification and Guides
modelcontextprotocol.io
github.com
github.com
claudecode.app
Auth0 – Intro to MCP and Authorization
auth0.com
auth0.com
Medium – MCP Authentication (Andrei T.) and others
auth0.com
dev.to
“MCP in AI” (Stackademic) – overview of components and examples
medium.com
medium.com
Model Context Protocol – Transports
github.com
modelcontextprotocol.io
 and Architecture
modelcontextprotocol.io
claudecode.app

 for design principles.