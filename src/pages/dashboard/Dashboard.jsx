import StatCard from "../../components/dashboard/StatCard"
import ProgressChart from "../../components/dashboard/ProgressChart"
import { dashboardData } from "../../services/dashboard.mock"

export default function Dashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total rutinas" value={dashboardData.total} />
                <StatCard title="Completadas" value={dashboardData.completed} />
                <StatCard title="Pendientes" value={dashboardData.pending} />
                <StatCard title="Postergadas" value={dashboardData.postponed} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProgressChart data={dashboardData} />
            </div>
        </div>
    )
}
