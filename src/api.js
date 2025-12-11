/**
 * Example of fixed code after AI PR Teammate processes it
 * This demonstrates the improvements the AI makes
 */

// ✅ Fixed: Proper error handling
export async function getUser(id) {
  try {
    // Input validation
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid user ID provided');
    }
    
    const user = await database.find(id);
    
    if (!user) {
      return {
        status: 404,
        error: 'User not found'
      };
    }
    
    return {
      status: 200,
      data: user
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      status: 500,
      error: 'Internal server error'
    };
  }
}

// ✅ Fixed: Input validation and error handling
export async function createUser(name, email) {
  try {
    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Invalid name provided');
    }
    
    if (!email || !isValidEmail(email)) {
      throw new Error('Invalid email provided');
    }
    
    const user = {
      id: generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      createdAt: Date.now()
    };
    
    await database.save(user);
    
    return {
      status: 201,
      data: user
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      status: 400,
      error: error.message
    };
  }
}

// ✅ Fixed: Proper async/await
export async function fetchUserData(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
}

// ✅ Fixed: Loading and error states
export function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchUserData(userId);
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadUser();
  }, [userId]);
  
  if (loading) {
    return <div className="spinner">Loading...</div>;
  }
  
  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  if (!user) {
    return <div>User not found</div>;
  }
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

// ✅ Fixed: Error boundary added
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong: {this.state.error?.message}</h1>;
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <div>
        <UserProfile userId="123" />
      </div>
    </ErrorBoundary>
  );
}

// ✅ Fixed: TypeScript types added
/**
 * @typedef {Object} Item
 * @property {number} price
 * @property {string} name
 */

/**
 * Calculate total price of items
 * @param {Item[]} items - Array of items
 * @returns {number} Total price
 */
export function calculateTotal(items) {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }
  
  return items.reduce((sum, item) => {
    if (typeof item.price !== 'number') {
      throw new Error('Item price must be a number');
    }
    return sum + item.price;
  }, 0);
}

// ✅ Fixed: SQL injection prevented with parameterized query
export async function getUserByEmail(email) {
  try {
    // Input validation
    if (!email || !isValidEmail(email)) {
      throw new Error('Invalid email provided');
    }
    
    // Use parameterized query to prevent SQL injection
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await database.query(query, [email]);
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

// ✅ Fixed: Proper HTTP status codes
export async function handleRequest(req, res) {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }
    
    const result = await getUser(userId);
    
    if (result.status === 404) {
      return res.status(404).json({
        error: result.error
      });
    }
    
    if (result.status === 500) {
      return res.status(500).json({
        error: result.error
      });
    }
    
    return res.status(200).json(result.data);
  } catch (error) {
    console.error('Error handling request:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

// Helper function for email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}