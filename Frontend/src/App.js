import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import CalendarPage from "./CalendarPage";
import LoginPage from "./Login/LoginPage";
import { getAccessToken } from "./Hooks/useAuth";
import PropTypes from "prop-types";

const PrivateRoute = ({ children }) => {
    const token = getAccessToken();
    return token ? children : <Navigate to="/login" replace />;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/calendar"
                    element={
                        <PrivateRoute>
                            <CalendarPage />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
