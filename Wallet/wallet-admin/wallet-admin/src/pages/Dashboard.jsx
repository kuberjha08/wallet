import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background-light p-10">
      <h1 className="text-3xl font-bold mb-4">
        Welcome, {user?.name}
      </h1>
      <p className="mb-2">Mobile: {user?.mobile}</p>
      <p className="mb-2">KYC Status: {user?.kycStatus}</p>

      <button
        onClick={logout}
        className="mt-6 bg-red-500 text-white px-6 py-2 rounded-lg"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
