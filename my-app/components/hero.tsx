export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-6">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
            <span className="text-blue-600">Energy</span>
            <span className="text-green-600">Consumption</span>
          </h1>
          <h2 className="mt-6 text-balance text-2xl font-semibold leading-8 text-muted-foreground sm:text-3xl">
            US City Energy Consumption Optimizer
          </h2>
          <p className="mt-4 text-pretty text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Explore energy consumption patterns across US cities and discover optimized solutions for a sustainable
            future.
          </p>
        </div>
      </div>
    </section>
  )
}
