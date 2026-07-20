import * as React from "react"
import { Search, Loader2, User, Building2, FolderGit2, Stethoscope } from "lucide-react"
import { useLocation } from "wouter"
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList 
} from "@/components/ui/command"
import { 
  useListPatients, 
  useListClinics, 
  useListUsers,
  useListPrograms
} from "@workspace/api-client-react"

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)
  const [, setLocation] = useLocation()
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])
  
  // Fetch with debounced search query
  const queryParams = { q: debouncedSearch || undefined, limit: 10 } as any;

  const { data: patientsData, isLoading: isLoadingPatients } = useListPatients(queryParams, { query: { enabled: open } as any })
  const { data: clinicsData, isLoading: isLoadingClinics } = useListClinics(queryParams, { query: { enabled: open } as any })
  const { data: usersData, isLoading: isLoadingUsers } = useListUsers(queryParams, { query: { enabled: open } as any })
  const { data: programsData, isLoading: isLoadingPrograms } = useListPrograms(queryParams, { query: { enabled: open } as any })

  const isLoading = isLoadingPatients || isLoadingClinics || isLoadingUsers || isLoadingPrograms;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background/50 backdrop-blur shadow-sm hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-10 w-full justify-start rounded-xl text-sm text-muted-foreground sm:pr-12 md:w-64 lg:w-80 group"
      >
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
        <span className="hidden lg:inline-flex">Search CareNexus...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-muted-foreground border border-border/50 shadow-inner group-hover:bg-background transition-colors">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Type to search patients, doctors, clinics..." 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-thin">
          {isLoading && search !== debouncedSearch ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Searching...
            </div>
          ) : (
            <>
              <CommandEmpty>No results found for "{debouncedSearch}"</CommandEmpty>
              
              {(patientsData?.data || []).length > 0 && (
                <CommandGroup heading="Patients">
                  {patientsData?.data?.map((patient: any) => (
                    <CommandItem
                      key={patient.id}
                      value={`patient-${patient.id}-${patient.firstName}-${patient.lastName}`}
                      onSelect={() => runCommand(() => setLocation(`/patients/${patient.id}`))}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                        <span className="text-xs text-muted-foreground">NHS: {patient.nhsNumber || "—"}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {(usersData?.data || []).length > 0 && (
                <CommandGroup heading="Doctors & Staff">
                  {usersData?.data?.map((user: any) => (
                    <CommandItem
                      key={user.id}
                      value={`user-${user.id}-${user.firstName}-${user.lastName}`}
                      onSelect={() => runCommand(() => setLocation(`/users/${user.id}`))}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <Stethoscope className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">Dr. {user.firstName} {user.lastName}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {(clinicsData?.data || []).length > 0 && (
                <CommandGroup heading="Clinics">
                  {clinicsData?.data?.map((clinic: any) => (
                    <CommandItem
                      key={clinic.id}
                      value={`clinic-${clinic.id}-${clinic.name}`}
                      onSelect={() => runCommand(() => setLocation(`/clinics`))}
                      className="flex items-center gap-3 py-3"
                    >
                       <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="font-medium">{clinic.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {(programsData?.data || []).length > 0 && (
                <CommandGroup heading="Programs">
                  {programsData?.data?.map((program: any) => (
                    <CommandItem
                      key={program.id}
                      value={`program-${program.id}-${program.name}`}
                      onSelect={() => runCommand(() => setLocation(`/programs`))}
                      className="flex items-center gap-3 py-3"
                    >
                       <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                        <FolderGit2 className="w-4 h-4 text-purple-500" />
                      </div>
                      <span className="font-medium">{program.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
