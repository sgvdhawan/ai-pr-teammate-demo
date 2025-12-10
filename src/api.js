/**
 * Example of problematic code for demo purposes
 * This file demonstrates common issues that AI PR Teammate can fix
 */

// ❌ Problem 1: No error handling
export function getUser(id) {
  const user = database.find(id);
  return user;
}

// ❌ Problem 2: No input validation
export function createUser(name, email) {
  const user = {
    id: generateId(),
    name: name,
    email: email,
    createdAt: Date.now()
  };
  database.save(user);
  return user;
}

// ❌ Problem 3: No async/await handling
export function fetchUserData(userId) {
  fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then(data => {
      return data;
    });
}

// ❌ Problem 4: No loading states in React component
export function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUserData(userId).then(setUser);
  }, [userId]);
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// ❌ Problem 5: Missing error boundaries
export function App() {
  return (
    <div>
      <UserProfile userId="123" />
    </div>
  );
}

// ❌ Problem 6: No TypeScript types
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Problem 7: Security issue - SQL injection
export function getUserByEmail(email) {
  const query = `SELECT * FROM users WHERE email = '${email}'`;
  return database.query(query);
}

// ❌ Problem 8: No proper HTTP status codes
export async function handleRequest(req, res) {
  const user = await getUser(req.params.id);
  res.send(user);
}
