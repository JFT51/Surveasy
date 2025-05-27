import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import { BarChart3, PieChart, Target } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
);

const AnalysisCharts = ({ analysisData }) => {
  // Prepare skill matching data
  const skillMatchingData = {
    labels: analysisData.skillMatches?.map(skill => skill.skill) || [],
    datasets: [
      {
        label: 'Skill Match Score',
        data: analysisData.skillMatches?.map(skill => Math.round(skill.confidence * 100)) || [],
        backgroundColor: analysisData.skillMatches?.map(skill => 
          skill.found ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ) || [],
        borderColor: analysisData.skillMatches?.map(skill => 
          skill.found ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'
        ) || [],
        borderWidth: 2,
        borderRadius: 4,
      }
    ]
  };

  // Prepare skill categories data
  const skillCategories = analysisData.nlpAnalysis?.skillCategories || {};
  const categoryData = {
    labels: Object.keys(skillCategories).map(key => {
      const labels = {
        technical: 'Technisch',
        soft: 'Soft Skills',
        tools: 'Tools',
        languages: 'Programmeertalen',
        frameworks: 'Frameworks',
        methodologies: 'Methodologieën'
      };
      return labels[key] || key;
    }),
    datasets: [
      {
        data: Object.values(skillCategories).map(skills => skills.length),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Prepare radar chart data for overall assessment
  const radarData = {
    labels: [
      'Technische Vaardigheden',
      'Werkervaring',
      'Opleiding',
      'Communicatie',
      'Skill Match',
      'Algemene Score'
    ],
    datasets: [
      {
        label: 'Kandidaat Profiel',
        data: [
          Math.min(Object.values(skillCategories).flat().length * 10, 100),
          Math.min((analysisData.nlpAnalysis?.experience?.totalYears || 0) * 15, 100),
          analysisData.nlpAnalysis?.education?.relevantToTech ? 85 : 60,
          analysisData.communicationAnalysis?.clarity || 70,
          analysisData.skillMatchScore || 0,
          analysisData.overallScore || 0
        ],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12
          },
          maxRotation: 45
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((context.parsed / total) * 100);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '50%'
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        ticks: {
          beginAtZero: true,
          max: 100,
          stepSize: 20,
          showLabelBackdrop: false,
          font: {
            size: 10
          }
        }
      }
    }
  };

  return (
    <div className="space-y-12">
      {/* Skills Matching Chart */}
      <div className="card">
        <div className="flex items-center mb-8">
          <BarChart3 className="w-8 h-8 text-primary-600 mr-4" />
          <h3 className="text-3xl font-bold text-neutral-900">Skill Matching Analyse</h3>
        </div>
        <div className="h-96">
          <Bar data={skillMatchingData} options={chartOptions} />
        </div>
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
          <p className="text-neutral-700">
            <strong>Uitleg:</strong> Deze grafiek toont hoe goed de kandidaat matcht met de gewenste vaardigheden. 
            Groene balken tonen gevonden vaardigheden, rode balken tonen ontbrekende vaardigheden.
          </p>
        </div>
      </div>

      {/* Skill Categories Chart */}
      <div className="card">
        <div className="flex items-center mb-8">
          <PieChart className="w-8 h-8 text-primary-600 mr-4" />
          <h3 className="text-3xl font-bold text-neutral-900">Vaardigheden per Categorie</h3>
        </div>
        <div className="h-96">
          <Doughnut data={categoryData} options={doughnutOptions} />
        </div>
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
          <p className="text-neutral-700">
            <strong>Uitleg:</strong> Deze grafiek toont de verdeling van gevonden vaardigheden per categorie. 
            Dit geeft inzicht in de sterke punten en expertise gebieden van de kandidaat.
          </p>
        </div>
      </div>

      {/* Overall Assessment Radar */}
      <div className="card">
        <div className="flex items-center mb-8">
          <Target className="w-8 h-8 text-primary-600 mr-4" />
          <h3 className="text-3xl font-bold text-neutral-900">Algemene Beoordeling</h3>
        </div>
        <div className="h-96">
          <Radar data={radarData} options={radarOptions} />
        </div>
        <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
          <p className="text-neutral-700">
            <strong>Uitleg:</strong> Deze radar grafiek toont een 360-graden overzicht van de kandidaat. 
            Hoe verder naar buiten, hoe sterker de kandidaat scoort op dat gebied.
          </p>
        </div>
      </div>

      {/* Chart Summary */}
      <div className="card">
        <h4 className="text-2xl font-semibold text-neutral-900 mb-6">Grafiek Samenvatting</h4>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-lg font-semibold text-blue-800 mb-2">Skill Matching</h5>
            <p className="text-blue-700">
              {analysisData.skillMatches?.filter(s => s.found).length || 0} van {analysisData.skillMatches?.length || 0} vaardigheden gevonden
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h5 className="text-lg font-semibold text-green-800 mb-2">Skill Categorieën</h5>
            <p className="text-green-700">
              {Object.keys(skillCategories).length} categorieën met {Object.values(skillCategories).flat().length} vaardigheden
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h5 className="text-lg font-semibold text-purple-800 mb-2">Algemene Score</h5>
            <p className="text-purple-700">
              {analysisData.overallScore || 0}/100 punten
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCharts;
