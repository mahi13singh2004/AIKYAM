import { useEffect, useState } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { jsPDF } from 'jspdf';
import Navbar from '../components/Navbar';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const ReportDashboard = () => {
  const [unsafeAreas, setUnsafeAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [casesLast24h, setCasesLast24h] = useState(0);
  const [percentageRise, setPercentageRise] = useState(0);
  const [hourlyData, setHourlyData] = useState([]);

  const defaultCenter = { lat: 10.7275, lng: 76.2900 };

  const stateCoordinates = {
    Karnataka: { north: 18.4, south: 11.6, east: 78.6, west: 74.0 },
    Maharashtra: { north: 22.1, south: 15.6, east: 80.9, west: 72.6 },
    Kerala: { north: 12.8, south: 8.3, east: 77.4, west: 74.9 },
    Delhi: { north: 28.88, south: 28.4, east: 77.35, west: 76.83 },
    'Tamil Nadu': { north: 13.5, south: 8.1, east: 80.3, west: 76.7 },
    'Uttar Pradesh': { north: 30.4, south: 24.0, east: 84.0, west: 77.1 },
    Rajasthan: { north: 30.2, south: 23.3, east: 78.0, west: 69.3 },
    Gujarat: { north: 24.7, south: 20.1, east: 74.4, west: 68.1 },
    'West Bengal': { north: 27.1, south: 21.5, east: 89.0, west: 85.8 },
    'Andhra Pradesh': { north: 19.2, south: 12.6, east: 84.8, west: 77.0 },
    Telangana: { north: 19.7, south: 15.8, east: 81.1, west: 77.5 },
    Punjab: { north: 32.3, south: 29.5, east: 76.9, west: 74.5 },
    Haryana: { north: 30.7, south: 27.7, east: 77.6, west: 74.5 },
    'Madhya Pradesh': { north: 26.8, south: 21.0, east: 82.8, west: 74.3 },
    'Chhattisgarh': { north: 24.5, south: 17.8, east: 84.2, west: 80.2 },
    Odisha: { north: 22.3, south: 17.7, east: 87.5, west: 81.4 },
    Bihar: { north: 27.5, south: 24.3, east: 88.0, west: 83.2 },
    Jharkhand: { north: 25.3, south: 22.1, east: 87.8, west: 84.0 },
    Assam: { north: 27.6, south: 24.1, east: 96.0, west: 89.7 },
    Meghalaya: { north: 26.0, south: 25.1, east: 92.8, west: 89.8 },
    Tripura: { north: 24.5, south: 22.9, east: 92.3, west: 91.2 },
    Manipur: { north: 25.7, south: 23.8, east: 94.8, west: 93.7 },
    Nagaland: { north: 27.1, south: 25.2, east: 95.2, west: 93.2 },
    'Arunachal Pradesh': { north: 29.2, south: 26.6, east: 97.4, west: 91.6 },
    Mizoram: { north: 24.5, south: 21.9, east: 93.4, west: 92.2 },
    Chennai: { north: 13.2, south: 12.9, east: 80.3, west: 80.1 },
  };

  const getStateFromCoordinates = (lat, lng) => {
    for (const [state, bounds] of Object.entries(stateCoordinates)) {
      if (lat <= bounds.north && lat >= bounds.south && lng <= bounds.east && lng >= bounds.west) {
        return state;
      }
    }
    console.log(`No state found for coordinates: lat=${lat}, lng=${lng}`);
    return 'Unknown';
  };

  const fetchUnsafeAreas = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/unsafe');
      if (!response.ok) throw new Error('Failed to fetch unsafe areas');
      const data = await response.json();
      const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      console.log('Fetched and sorted unsafe areas:', sortedData);
      setUnsafeAreas(sortedData);

      const now = new Date();
      const last24h = new Date(now - 24 * 60 * 60 * 1000);
      const previous24h = new Date(last24h - 24 * 60 * 60 * 1000);

      const recentCases = sortedData.filter(area => new Date(area.createdAt) >= last24h);
      const previousCases = sortedData.filter(area => new Date(area.createdAt) >= previous24h && new Date(area.createdAt) < last24h);

      const recentCount = recentCases.length;
      const previousCount = previousCases.length;

      setCasesLast24h(recentCount);
      const rise = previousCount > 0 ? ((recentCount - previousCount) / previousCount) * 100 : recentCount > 0 ? 100 : 0;
      setPercentageRise(rise.toFixed(2));

      const hourlyBuckets = Array(24).fill(0).map((_, i) => {
        const hourStart = new Date(now - (24 - i) * 60 * 60 * 1000);
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
        const count = sortedData.filter(area => {
          const areaTime = new Date(area.createdAt);
          return areaTime >= hourStart && areaTime < hourEnd;
        }).length;
        return { hour: hourStart.getHours(), count };
      });
      setHourlyData(hourlyBuckets);

      setLoading(false);
    } catch (err) {
      console.log(err);
      setError('Failed to fetch unsafe areas data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnsafeAreas();
    const interval = setInterval(fetchUnsafeAreas, 300000);
    return () => clearInterval(interval);
  }, []);

  const categorizeByRegion = () => {
    const regions = { North: 0, South: 0, East: 0, West: 0 };
    unsafeAreas.forEach(area => {
      const latDiff = area.lat - defaultCenter.lat;
      const lngDiff = area.lng - defaultCenter.lng;
      if (latDiff > 0 && Math.abs(latDiff) > Math.abs(lngDiff)) regions.North++;
      else if (latDiff < 0 && Math.abs(latDiff) > Math.abs(lngDiff)) regions.South++;
      else if (lngDiff > 0 && Math.abs(lngDiff) >= Math.abs(latDiff)) regions.East++;
      else if (lngDiff < 0 && Math.abs(lngDiff) >= Math.abs(latDiff)) regions.West++;
    });
    return regions;
  };

  const regionsData = categorizeByRegion();

  const lineChartData = {
    labels: unsafeAreas.map(area => new Date(area.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'Cumulative Unsafe Areas',
        data: unsafeAreas.map((_, index) => unsafeAreas.slice(0, index + 1).length),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        fill: true,
      },
    ],
  };

  const last7Days = Array(7).fill().map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString();
  }).reverse();

  const barChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Daily Unsafe Areas',
        data: last7Days.map(date => {
          const dayData = unsafeAreas.filter(area => new Date(area.createdAt).toLocaleDateString() === date);
          return dayData.length;
        }),
        backgroundColor: '#34D399',
      },
    ],
  };

  const pieChartData = {
    labels: ['North', 'South', 'East', 'West'],
    datasets: [
      {
        label: 'Unsafe Areas by Region',
        data: [regionsData.North, regionsData.South, regionsData.East, regionsData.West],
        backgroundColor: ['#EF4444', '#3B82F6', '#FBBF24', '#10B981'],
        hoverOffset: 4,
      },
    ],
  };

  const hourlyChartData = {
    labels: hourlyData.map(item => `${item.hour}:00`),
    datasets: [
      {
        label: 'Hourly Unsafe Reports',
        data: hourlyData.map(item => item.count),
        backgroundColor: '#F97316',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#E5E7EB' } },
      title: { display: true, color: '#E5E7EB' },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#E5E7EB' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#E5E7EB' },
      },
    },
    layout: {
      padding: 10,
    },
    backgroundColor: '#1F2937',
  };

  const downloadPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const usableWidth = pageWidth - 2 * margin;
    let yPosition = margin;
  
    // Cover Page
    doc.setFillColor(255, 0, 0); // Red background
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFillColor(0, 0, 0); // Black bottom half
    doc.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, 'F');
    
    doc.setFontSize(40);
    doc.setTextColor(255, 255, 255); // White text
    doc.setFont('helvetica', 'bold');
    doc.text('Unsafe Areas', margin, pageHeight / 3, { maxWidth: usableWidth });
    doc.text('Report', margin, pageHeight / 3 + 20, { maxWidth: usableWidth });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, pageHeight / 3 + 40, { maxWidth: usableWidth });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.text('Comprehensive Safety Analysis', margin, pageHeight - margin - 10);
    doc.addPage();
  
    // Header function for content pages
    const addHeader = () => {
      doc.setFillColor(255, 255, 255); // White background
      doc.rect(0, 0, pageWidth, pageHeight, 'F'); // White page background
      doc.setFillColor(0, 0, 0); // Black header
      doc.rect(0, 0, pageWidth, 20, 'F');
      
      doc.setTextColor(255, 255, 255); // White text for header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Unsafe Areas Report', margin, 12);
      
      doc.setFontSize(10);
      doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - margin - 20, 12);
    };
    addHeader();
    yPosition = 25;
  
    // Content styling
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', margin, yPosition);
    doc.setDrawColor(0, 0, 0); // Black underline
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition + 2, margin + 50, yPosition + 2);
    yPosition += 8;
  
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Unsafe Areas in Last 24 Hours:', margin, yPosition);
    doc.text(`${casesLast24h}`, margin + 70, yPosition);
    yPosition += 6;
  
    doc.text('Percentage Rise:', margin, yPosition);
    doc.text(`${percentageRise}%`, margin + 70, yPosition);
    yPosition += 6;
  
    doc.text('Total Unsafe Areas:', margin, yPosition);
    doc.text(`${unsafeAreas.length}`, margin + 70, yPosition);
    yPosition += 15;
  
    const charts = [
      { id: 'lineChart', title: 'Cumulative Unsafe Areas Over Time', borderColor: [0, 0, 0] }, // Black border
      { id: 'barChart', title: 'Daily Unsafe Areas (Last 7 Days)', borderColor: [0, 0, 0] },
      { id: 'pieChart', title: 'Unsafe Areas by Region', borderColor: [0, 0, 0] },
      { id: 'hourlyChart', title: 'Hourly Unsafe Reports (Last 24 Hours)', borderColor: [0, 0, 0] },
    ];
  
    charts.forEach((chart) => {
      const canvas = document.getElementById(chart.id);
      if (canvas) {
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const aspectRatio = canvasWidth / canvasHeight;
        const pdfWidth = usableWidth - 10;
        const pdfHeight = pdfWidth / aspectRatio;
  
        if (yPosition + pdfHeight + 25 > pageHeight - margin) {
          doc.addPage();
          addHeader();
          yPosition = 25;
        }
  
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(chart.title, margin, yPosition);
        yPosition += 6;
  
        doc.setDrawColor(...chart.borderColor);
        doc.setLineWidth(0.5);
        doc.rect(margin - 5, yPosition - 5, pdfWidth + 10, pdfHeight + 10);
  
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        doc.addImage(imgData, 'JPEG', margin, yPosition, pdfWidth, pdfHeight, undefined, 'FAST');
        yPosition += pdfHeight + 20;
      }
    });
  
    // Footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Black text
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${pageCount - 1}`, pageWidth - margin - 20, pageHeight - margin);
      if (i > 1) {
        doc.setDrawColor(0, 0, 0); // Black separator
        doc.setLineWidth(0.2);
        doc.line(margin, pageHeight - margin - 5, pageWidth - margin, pageHeight - margin - 5);
      }
    }
  
    doc.save('unsafe_areas_report.pdf');
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchUnsafeAreas();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:shadow-3xl">
          <div className="bg-red-500 p-6">
            <h1 className="text-3xl font-bold text-white tracking-tight">Unsafe Areas Report Dashboard</h1>
            <p className="text-blue-200 mt-2">Detailed insights into unsafe area statistics with advanced analytics</p>
          </div>

          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-3/4 p-6">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-400"></div>
                </div>
              ) : error ? (
                <p className="text-red-400 text-center">{error}</p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
                      <h3 className="text-lg font-semibold">Unsafe Areas (Last 24h)</h3>
                      <p className="text-4xl font-bold mt-2">{casesLast24h}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
                      <h3 className="text-lg font-semibold">Percentage Rise</h3>
                      <p className="text-4xl font-bold mt-2">{percentageRise}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-xl shadow-lg text-white transform hover:scale-105 transition-transform duration-300">
                      <h3 className="text-lg font-semibold">Total Unsafe Areas</h3>
                      <p className="text-4xl font-bold mt-2">{unsafeAreas.length}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                      <Line id="lineChart" data={lineChartData} options={chartOptions} />
                    </div>
                    <div className="bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                      <Bar id="barChart" data={barChartData} options={chartOptions} />
                    </div>
                    <div className="bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                      <Pie id="pieChart" data={pieChartData} options={chartOptions} />
                    </div>
                    <div className="bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                      <Bar id="hourlyChart" data={hourlyChartData} options={chartOptions} />
                    </div>
                  </div>

                  <div className="mt-8 bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-200">Recent Unsafe Areas</h3>
                      <button
                        onClick={handleRefresh}
                        className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                      >
                        Refresh
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-600">
                        <thead className="bg-gray-600">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Latitude</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Longitude</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Region</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">State</th>
                          </tr>
                        </thead>
                        <tbody className="bg-gray-700 divide-y divide-gray-600">
                          {unsafeAreas.slice(0, 5).map(area => {
                            const latDiff = area.lat - defaultCenter.lat;
                            const lngDiff = area.lng - defaultCenter.lng;
                            let region = 'Center';
                            if (latDiff > 0 && Math.abs(latDiff) > Math.abs(lngDiff)) region = 'North';
                            else if (latDiff < 0 && Math.abs(latDiff) > Math.abs(lngDiff)) region = 'South';
                            else if (lngDiff > 0 && Math.abs(lngDiff) >= Math.abs(latDiff)) region = 'East';
                            else if (lngDiff < 0 && Math.abs(lngDiff) >= Math.abs(latDiff)) region = 'West';

                            const state = getStateFromCoordinates(area.lat, area.lng);

                            return (
                              <tr key={area._id} className="hover:bg-gray-600 transition-colors duration-200">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(area.createdAt).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{area.lat.toFixed(4)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{area.lng.toFixed(4)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{region}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{state}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="lg:w-1/4 p-6 bg-gradient-to-b from-gray-700 to-gray-800 border-l border-gray-600">
              <div className="space-y-6">
                <button
                  onClick={downloadPDF}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
                >
                  Download PDF Report
                </button>

                <div className="bg-gray-600 p-6 rounded-xl shadow-md">
                  <h3 className="font-semibold text-gray-200 mb-4 text-lg">Insights</h3>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-center">
                      <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                      Highest activity: {hourlyData.length > 0 ? `${Math.max(...hourlyData.map(d => d.count))} reports at ${hourlyData.reduce((max, item) => item.count > max.count ? item : max, hourlyData[0]).hour}:00` : 'N/A'}
                    </li>
                    <li className="flex items-center">
                      <span className="w-3 h-3 bg-red-400 rounded-full mr-2"></span>
                      Most affected region: {Object.keys(regionsData).reduce((a, b) => regionsData[a] > regionsData[b] ? a : b, 'North')}
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-600 p-6 rounded-xl shadow-md">
                  <h3 className="font-semibold text-gray-200 mb-4 text-lg">Instructions</h3>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li>View real-time unsafe area statistics.</li>
                    <li>Check areas marked unsafe in the last 24 hours.</li>
                    <li>Explore regional distribution and hourly trends.</li>
                    <li>Download the detailed report as PDF.</li>
                  </ul>
                </div>

                <div className="bg-gray-600 p-6 rounded-xl shadow-md">
                  <h3 className="font-semibold text-gray-200 mb-4 text-lg">Chart Legend</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-400 rounded-full mr-2"></div>
                      <span className="text-gray-300">Cumulative Unsafe Areas</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-teal-400 rounded-full mr-2"></div>
                      <span className="text-gray-300">Daily Unsafe Areas</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-orange-400 rounded-full mr-2"></div>
                      <span className="text-gray-300">Hourly Reports</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;