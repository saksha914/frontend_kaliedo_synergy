import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { adminAPI } from "../utils/api.ts";
import { Button } from "../components/Button.tsx";
import { Card } from "../components/Card.tsx";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner.tsx";
import { authAPI } from "../utils/api.ts";

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.listUsers();
      // Filter out admin users
      setUsers(data.filter((u: any) => u.role !== "admin"));
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") return <div className="p-8 text-center">Access denied</div>;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-bold text-xl">Users</h2>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </div>
      {loading && <LoadingSpinner size="md" />}
      {!loading && (
        <Card>
          <ul>
            {users.map((u) => (
              <li key={u.id} className="mb-2">
                <Button onClick={() => navigate(`/admin/user/${u.id}`)} variant="outline">{u.username}</Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default AdminPanel; 