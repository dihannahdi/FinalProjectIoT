import React from 'react';
import { FaTrophy, FaMedal, FaAward } from 'react-icons/fa';

const LeaderboardTable = ({ scores, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!scores || scores.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <p className="text-lg text-gray-600">No scores available yet. Be the first to play!</p>
      </div>
    );
  }

  // Get medal based on position
  const getMedal = (position) => {
    switch (position) {
      case 0:
        return <FaTrophy className="text-yellow-500" title="1st Place" />;
      case 1:
        return <FaMedal className="text-gray-400" title="2nd Place" />;
      case 2:
        return <FaMedal className="text-yellow-700" title="3rd Place" />;
      default:
        return <FaAward className="text-blue-500" title="Top Performer" />;
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full">
        <thead>
          <tr className="bg-blue-600 text-white">
            <th className="px-4 py-3 text-left w-16">#</th>
            <th className="px-4 py-3 text-left">Player</th>
            <th className="px-4 py-3 text-center">Score</th>
            <th className="px-4 py-3 text-right">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {scores.map((score, index) => (
            <tr key={index} className={index < 3 ? 'bg-blue-50' : ''}>
              <td className="px-4 py-3 flex items-center">
                <span className="mr-2">{index + 1}</span>
                {index < 5 && getMedal(index)}
              </td>
              <td className="px-4 py-3 font-medium">
                {score.player}
              </td>
              <td className="px-4 py-3 text-center font-bold">
                {score.score}
              </td>
              <td className="px-4 py-3 text-right text-gray-500">
                {new Date(score.timestamp).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable; 