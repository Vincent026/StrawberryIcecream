<script>
	import Box from './Box.svelte';
	export let name;
</script>

<main>
	<Box>
		<h2>curriculum vitae</h2>
	</Box>
	<Box>
		<h4>Domeinen</h4>
		<p>1. Plannings- en beheersoftware voor uitzenddiensten van personenwagenvervoer en locatiewerk.</p>
		<p>2. hedgingsoftware voor grondstoffenhandel.</p>
	</Box>
	<Box>
		<h4>Projecten 2021</h4>
		<p>Docker</p>
		<p>Svelte</p>
	</Box>
	<Box>
		<h4>Projecten 2020</h4>
		<p>proof of concept maken voor API: REST, GraphQL, gRPC</p>
		<p>proof of concept maken voor frontend in .NET Core: Razor Pages, MVC, Blazor</p>
		<p>ontsluiten legacy .net 4.6 code in een gRPC- en GraphQL-service</p>
	</Box>
	<Box>
		<h4>Projecten 2016 - 2019</h4>
		<p>- opzetten CI/CD pipeline voor verschillende applicatietypes in TFS</p>
		<p>- workItem-synchronisatie tussen TFS en monday.com</p>
		<p>- integratie tussen MoreApp-formulieren en backendsysteem</p>
		<p>- integratie tussen AFAS en backendsysteem</p>
		<p>- migratie van legacy database/software naar Entity Framework en hogere .net versie</p>
		<p>- verplaatsen rekeninstensieve query naar SQL Azure en tabel vullen met bulkinsert</p>
		<p>- Single Sign On (SSO) voor drie websites realiseren met eigen autorisatieserver</p>
		<p>- integratie van een 3d party (Python-)planningsalgoritme met backendsysteem</p>
		<p>- ontwerpen en bouwen van een algoritme voor planning van locatiewerk</p>
		<p>- toevoegen en refactoren van diverse functionaliteit aan bestaande software</p>
		<h3>Analyse en ontwerp</h3>
		<p>- aandacht voor onderhoudbaarheid, testbaarheid, beveiliging, stabiliteit, performance, duidelijk ontwerp / design patterns, logging en documentatie.</p>
		<p>opstellen van specificaties en urenbegroting</p>
		<p>Test Driven uitwerking van gedetailleerde specs</p>
		<h4>GUI ontwerp</h4>
		<h4>DevOps en projectplanning</h4>
		<p>Build- en Release-omgeving inrichten onderhouden in TFS 2015/’18</p>
		<p>REST-API en client libraries TFS, PowerShell, Branching & Merging in TFVC, FTP.</p>
		<p>optimaliseren in TFS van het configuratiebeheer van de applicaties</p>
		<p>installatie(scripts) van webapplicaties in IIS / installeren SSL certificaten</p>
		<p>° Windows Server 2008/12/16 (basis DevOps gebruik)</p>
		<p>° sprintplanning in TFS</p>
		<h4>Ontwikkeling</h4>
		<p>• Uitbouwen en onderhouden desktop-apps, websites / webservices en Windows Services</p>
		<p>• unittesten en CodedUI-testen</p>
		<p>• ASP.NET WebForms + MVC / WebAPI / OWIN / javascript (summier)</p>
		<p>• SSO met IdentityServer3. Later gemigreerd naar IdentityServer4 / ASP.NET Core / Dapper.</p>
		<p>• Windows Services / FireDaemon om Python scripts te hosten, alsmede enig onderhoud aan Python code zelf</p>
		<p>• WinForms  (VB.NET en C#)</p>
		<p>• SQL Server 2012/16 / Entity Framework / LINQ</p>
		<p>• Google Docs API</p>
		<p>• SpreadheetLight</p>
		<p>• Azure (SQL / Storage)</p>
		<p>• Unity + Simple Injector / SeriLog</p>
		<p>• diversen, o.a. RegEx, xpath, xml/json parsing</p>
	</Box>
	<Box>
		<p>hier komen de projecten van 1994 - 2016</p>
	</Box>


	<p>
		Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.
	</p>

</main>

<style>
	main {
		text-align: left;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>