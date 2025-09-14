import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface CityData {
  name: string
  state: string
  population: number
  region: string
}

interface CityHeaderProps {
  city: CityData
}

export function CityHeader({ city }: CityHeaderProps) {
  return (
    <header className="relative bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Search
            </Link>
          </Button>
        </div>

        <div className="text-center">
          <h1 className="text-balance text-6xl font-bold tracking-tight text-foreground sm:text-8xl lg:text-9xl">
            {city.name}
          </h1>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-xl text-muted-foreground">
            <span className="font-medium">{city.state}</span>
            <span className="hidden sm:block">•</span>
            <span>Population: {city.population.toLocaleString()}</span>
            <span className="hidden sm:block">•</span>
            <span>Grid Region: {city.region}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
