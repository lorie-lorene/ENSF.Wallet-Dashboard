import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Users, UserCheck, TrendingUp, Building2, Shield, FileImage,
  ArrowUpRight, ArrowDownRight, Loader, RefreshCw, Plus, Eye,
  BarChart3, Database, Wifi, Server, AlertTriangle, CheckCircle
} from 'lucide-react';

/**
 * 📊 Overview Tab Component
 * 
 * Displays comprehensive dashboard overview with:
 * - Key statistics from UserService and AgenceService
 * - System health monitoring
 * - Interactive charts and visualizations
 * - Quick action buttons
 * - Real-time data updates
 */
const OverviewTab = ({ 
  loading, 
  errors, 
  dashboardData, 
  combinedStatistics, 
  chartData, 
  userRole,
  onRefresh 
}) => {

  /**
   * Statistics Card Component
   */
  const StatCard = ({ title, value, trend, trendValue, icon: Icon, color, loading: cardLoading, onClick }) => (
    <div 
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          {cardLoading ? (
            <div className="flex items-center space-x-2">
              <Loader className="h-4 w-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">Chargement...</span>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              {typeof value === 'number' ? value.toLocaleString() : value || '—'}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      {trend && trendValue && !cardLoading && (
        <div className={`flex items-center mt-4 text-sm ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          {trendValue} depuis le mois dernier
        </div>
      )}
    </div>
  );

  /**
   * System Health Indicator Component
   */
  const SystemHealthIndicator = () => {
    const health = dashboardData.agenceService.health;
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">État du Système</h3>
          <button
            onClick={onRefresh.health}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
            disabled={loading.health}
          >
            {loading.health ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </button>
        </div>
        
        {health ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Statut général</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                health.status === 'UP' 
                  ? 'bg-green-100 text-green-700'
                  : health.status === 'PARTIAL'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {health.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Base de données
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                health.database === 'UP' 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {health.database}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center">
                <Wifi className="h-4 w-4 mr-2" />
                Messaging
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                health.messaging === 'UP' 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {health.messaging}
              </span>
            </div>
            
            {health.dependencies && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">Services Externes</p>
                {Object.entries(health.dependencies).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 capitalize">{service}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      status === 'UP' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-400">
                Dernière vérification: {new Date(health.timestamp).toLocaleTimeString('fr-FR')}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <AlertTriangle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">Données de santé indisponibles</p>
          </div>
        )}
      </div>
    );
  };

  /**
   * Recent Activity Component
   */
  const RecentActivity = () => {
    const activity = dashboardData.agenceService.recentActivity;
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
        
        {activity ? (
          <div className="space-y-3">
            {activity.recentLogins && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connexions récentes</span>
                <span className="text-sm font-medium text-gray-900">{activity.recentLogins}</span>
              </div>
            )}
            {activity.recentUserCreations && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Nouveaux utilisateurs</span>
                <span className="text-sm font-medium text-gray-900">{activity.recentUserCreations}</span>
              </div>
            )}
            {activity.systemEvents && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Événements système</span>
                <span className="text-sm font-medium text-gray-900">{activity.systemEvents}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  /**
   * Quick Actions Component
   */
  const QuickActions = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => {/* Handle create user */}}
          className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
        >
          <Plus className="h-5 w-5 text-blue-500 mr-3 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700">Créer Utilisateur</div>
            <div className="text-xs text-gray-500">Ajouter un nouvel utilisateur</div>
          </div>
        </button>
        
        <button
          onClick={() => {/* Handle view documents */}}
          className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group"
        >
          <FileImage className="h-5 w-5 text-green-500 mr-3 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700">Documents Pendants</div>
            <div className="text-xs text-gray-500">
              {combinedStatistics?.pendingDocuments || 0} en attente
            </div>
          </div>
        </button>
        
        <button
          onClick={onRefresh.dashboard}
          disabled={loading.dashboard}
          className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
        >
          {loading.dashboard ? (
            <Loader className="h-5 w-5 text-purple-500 mr-3 animate-spin" />
          ) : (
            <BarChart3 className="h-5 w-5 text-purple-500 mr-3 group-hover:scale-110 transition-transform" />
          )}
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700">Actualiser Stats</div>
            <div className="text-xs text-gray-500">Mettre à jour les données</div>
          </div>
        </button>
        
        <button
          onClick={() => {/* Handle view users */}}
          className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group"
        >
          <Users className="h-5 w-5 text-orange-500 mr-3 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700">Gérer Utilisateurs</div>
            <div className="text-xs text-gray-500">
              {combinedStatistics?.totalUsers || 0} utilisateurs
            </div>
          </div>
        </button>
        
        <button
          onClick={() => {/* Handle system health */}}
          className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-red-300 hover:bg-red-50 transition-colors group"
        >
          <Shield className="h-5 w-5 text-red-500 mr-3 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700">Santé Système</div>
            <div className="text-xs text-gray-500">
              {combinedStatistics?.systemHealth || 'Inconnue'}
            </div>
          </div>
        </button>
        
        <button
          onClick={() => {/* Handle reports */}}
          className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
        >
          <Eye className="h-5 w-5 text-indigo-500 mr-3 group-hover:scale-110 transition-transform" />
          <div className="text-left">
            <div className="text-sm font-medium text-gray-700">Voir Rapports</div>
            <div className="text-xs text-gray-500">Analyses détaillées</div>
          </div>
        </button>
      </div>
    </div>
  );

  /**
   * Performance Metrics Component
   */
  const PerformanceMetrics = () => {
    const metrics = [
      {
        label: 'Taux d\'Approbation',
        value: combinedStatistics ? 
          (combinedStatistics.activeClients / (combinedStatistics.totalClients || 1) * 100).toFixed(1) + '%' : 
          '—',
        change: '+2.3%',
        trend: 'up'
      },
      {
        label: 'Temps Moyen Traitement',
        value: '2.4h',
        change: '-15min',
        trend: 'up'
      },
      {
        label: 'Satisfaction Client',
        value: '94.2%',
        change: '+1.8%',
        trend: 'up'
      }
    ];

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Métriques de Performance</h3>
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                <p className="text-lg font-bold text-gray-700">{metric.value}</p>
              </div>
              <div className={`flex items-center text-sm ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {metric.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={combinedStatistics?.totalClients}
          trend="up"
          trendValue="+12.5%"
          icon={Users}
          color="bg-blue-500"
          loading={loading.statistics}
        />
        <StatCard
          title="Clients Actifs"
          value={combinedStatistics?.activeClients}
          trend="up"
          trendValue="+8.2%"
          icon={UserCheck}
          color="bg-green-500"
          loading={loading.statistics}
        />
        <StatCard
          title="Nouveaux Aujourd'hui"
          value={combinedStatistics?.newClientsToday}
          trend="up"
          trendValue="+15%"
          icon={TrendingUp}
          color="bg-purple-500"
          loading={loading.statistics}
        />
        <StatCard
          title={userRole === 'BANK_ADMIN' ? 'Total Agences' : 'Utilisateurs Système'}
          value={userRole === 'BANK_ADMIN' ? 24 : combinedStatistics?.totalUsers}
          icon={userRole === 'BANK_ADMIN' ? Building2 : Shield}
          color="bg-orange-500"
          loading={loading.statistics || loading.dashboard}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Documents en Attente"
          value={combinedStatistics?.pendingDocuments}
          icon={FileImage}
          color="bg-yellow-500"
          loading={loading.documents}
        />
        <StatCard
          title="Utilisateurs en Attente"
          value={combinedStatistics?.pendingUsers}
          icon={Users}
          color="bg-indigo-500"
          loading={loading.users}
        />
        <StatCard
          title="Comptes Bloqués"
          value={combinedStatistics?.blockedClients}
          icon={Shield}
          color="bg-red-500"
          loading={loading.statistics}
        />
        <StatCard
          title="Statut Système"
          value={combinedStatistics?.systemHealth}
          icon={Server}
          color={
            combinedStatistics?.systemHealth === 'UP' ? 'bg-green-500' :
            combinedStatistics?.systemHealth === 'PARTIAL' ? 'bg-yellow-500' : 'bg-red-500'
          }
          loading={loading.health}
        />
      </div>

      {/* Charts and Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Clients</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Clients']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64">
              <Loader className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        {/* System Health */}
        <SystemHealthIndicator />
      </div>

      {/* Activity Growth Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance de l'Activité</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[
            { name: 'Jan', clients: 890, users: 45 },
            { name: 'Fév', clients: 920, users: 52 },
            { name: 'Mar', clients: 980, users: 61 },
            { name: 'Avr', clients: 1050, users: 73 },
            { name: 'Mai', clients: 1120, users: 89 },
            { name: 'Juin', clients: combinedStatistics?.totalClients || 1250, users: combinedStatistics?.totalUsers || 95 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="clients"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Clients"
            />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Utilisateurs"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <QuickActions />
        <RecentActivity />
        <PerformanceMetrics />
      </div>
    </div>
  );
};

export default OverviewTab;