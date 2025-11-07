import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import CalendarPage from "./CalendarPage";
import LoginPage from "./Login/LoginPage";
import MarketplacePage from "./Pages/MarketplacePage";
import RankingPage from "./Pages/RankingPage";
import ReportsPage from "./Pages/ReportsPage";
import PropTypes from "prop-types";
import { useAuth } from "./Hooks/useAuth";
import { UserPreferencesProvider } from "./Context/UserPreferencesContext";

const PrivateRoute = ({ children }) => {
    const { getAccessToken } = useAuth();
    const token = getAccessToken();
    return token ? children : <Navigate to="/login" replace />;
};

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

function App() {
    return (
        <UserPreferencesProvider>
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
                    <Route
                        path="/marketplace"
                        element={
                            <PrivateRoute>
                                <MarketplacePage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/ranking"
                        element={
                            <PrivateRoute>
                                <RankingPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <PrivateRoute>
                                <ReportsPage />
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </Router>
        </UserPreferencesProvider>
    );
}

export default App;
