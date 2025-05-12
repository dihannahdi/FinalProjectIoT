import React from 'react';
import { FaTrophy, FaMedal, FaAward, FaGamepad } from 'react-icons/fa';

const LeaderboardTable = ({ scores, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-md">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-4 border-t-blue-600 mb-4"></div>
        <p className="text-blue-600 font-medium animate-pulse">Loading leaderboard...</p>
      </div>
    );
  }

  if (!scores || scores.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaGamepad className="text-blue-500 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Scores Yet</h3>
        <p className="text-gray-600 mb-6">Be the first to play and get on the leaderboard!</p>
        <a href="/game" className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Play Now
        </a>
      </div>
    );
  }

  // Get medal based on position
  const getMedal = (position) => {
    switch (position) {
      case 0:
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full mr-3">
            <FaTrophy className="text-yellow-500" title="1st Place" />
          </div>
        );
      case 1:
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mr-3">
            <FaMedal className="text-gray-400" title="2nd Place" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-amber-100 rounded-full mr-3">
            <FaMedal className="text-yellow-700" title="3rd Place" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 bg-blue-50 rounded-full mr-3">
            <FaAward className="text-blue-500" title="Top Performer" />
          </div>
        );
    }
  };

  return (
    <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <th className="px-6 py-4 text-left w-24 font-semibold text-sm uppercase tracking-wider">Rank</th>
            <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Player</th>
            <th className="px-6 py-4 text-center font-semibold text-sm uppercase tracking-wider">Score</th>
            <th className="px-6 py-4 text-right font-semibold text-sm uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {scores.map((score, index) => (
            <tr 
              key={index} 
              className={`
                ${index < 3 ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'} 
                transition-colors
              `}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {index < 5 ? (
                    getMedal(index)
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center mr-3 text-gray-500 font-semibold">
                      {index + 1}
                    </div>
                  )}
                  <span className={`font-semibold ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : index === 2 ? 'text-yellow-800' : 'text-gray-700'}`}>
                    {index < 5 ? `#${index + 1}` : `#${index + 1}`}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-gray-900 font-medium">
                  {score.player}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className={`text-lg font-bold ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-600' : index === 2 ? 'text-yellow-800' : 'text-blue-600'}`}>
                  {score.score}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                {new Date(score.timestamp).toLocaleDateString(undefined, {
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric'
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable; 