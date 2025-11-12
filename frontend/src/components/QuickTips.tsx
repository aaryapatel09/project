export default function QuickTips() {
  const tips = [
    {
      icon: '🎯',
      title: 'Track Design',
      description: 'Balance straights and corners for exciting racing',
    },
    {
      icon: '💨',
      title: 'DRS Zones',
      description: 'Add DRS to long straights for more overtaking',
    },
    {
      icon: '🏔️',
      title: 'Elevation',
      description: 'Elevation changes add challenge and excitement',
    },
    {
      icon: '🔄',
      title: 'Banking',
      description: 'Higher banking allows faster cornering speeds',
    },
    {
      icon: '🛡️',
      title: 'Safety',
      description: 'Monitor safety rating to ensure driver protection',
    },
    {
      icon: '⚡',
      title: 'Sectors',
      description: 'Divide track into 3 sectors for timing analysis',
    },
  ]

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>💡</span>
        <span>Quick Tips</span>
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {tips.map((tip) => (
          <div
            key={tip.title}
            className="bg-gray-900 bg-opacity-50 rounded-lg p-3 hover:bg-opacity-70 transition-all"
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">{tip.icon}</span>
              <div>
                <div className="text-sm font-semibold text-white mb-1">
                  {tip.title}
                </div>
                <div className="text-xs text-gray-400">{tip.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

