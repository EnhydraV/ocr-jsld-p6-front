import { useLoaderData } from 'react-router';
import { Olympic } from '../types/olympic';

export default function Home() {
  const olympics = useLoaderData<Array<Olympic>>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4 text-center">Jeux Olympiques</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        Donnees de {olympics.length} pays chargees
      </p>

      <div className="space-y-8">
        {olympics.map((olympic) => (
          <div key={olympic.id} className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">
              {olympic.country}
            </h2>
            <div className="space-y-4">
              {olympic.participations.map((participation) => (
                <div
                  key={participation.id}
                  className="border-l-4 border-blue-400 pl-4 py-2"
                >
                  <p className="font-semibold text-lg">
                    JO de {participation.city} - {participation.year}
                  </p>
                  <p className="text-gray-700">
                    {participation.athleteCount} participants ont remporte{' '}
                    {participation.medalsCount} medailles
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
