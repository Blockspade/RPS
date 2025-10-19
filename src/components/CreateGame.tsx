interface CreateGameProps {
  account: string;
  onBack: () => void;
}

export default function CreateGame({ account, onBack }: CreateGameProps) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700 transition mb-4"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Create New Game</h2>
          <p className="text-xs text-gray-500 mt-1">
            {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Move
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button className="py-3 px-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
                <div className="text-2xl mb-1">✊</div>
                <div className="text-xs font-medium">Rock</div>
              </button>
              <button className="py-3 px-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
                <div className="text-2xl mb-1">📄</div>
                <div className="text-xs font-medium">Paper</div>
              </button>
              <button className="py-3 px-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
                <div className="text-2xl mb-1">✂️</div>
                <div className="text-xs font-medium">Scissors</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opponent Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stake Amount (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              placeholder="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition shadow-md hover:shadow-lg">
            Create Game
          </button>
        </div>
      </div>
    </div>
  );
}

