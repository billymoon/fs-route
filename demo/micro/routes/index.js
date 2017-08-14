export default ({ req: { method } }) => `{"whoami": "I am the root index handler", "callingMethod": "${method}"}`
