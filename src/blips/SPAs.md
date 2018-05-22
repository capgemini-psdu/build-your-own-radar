---
  name: SPAs
  ring: core
  quadrant: methods & patterns
  capability: average
---
The popularity of JavaScript UI frameworks like AngularJS and ReactJS, as well as full stack frameworks like Node.js, has led to a trend away from RESTful server-side MVC architectures towards Single Page Applications (SPAs).
<br/><br/>
Our view is that there are pros and cons to SPAs that should be considered for your specific use case.
<br/><br/>
Advantages:
<ul>
<li>Can result in much less chatty applications that fetch only the data they need for each page rather than re-fetching large amounts of duplicated HTML.</li>
<li>Drives the architecture towards separation of the web application and REST APIs exposing the data (if this is what you want).</li>
<li>Makes state management easier by moving the problem (session management) out of the server and into the client via techniques like HTML5 pushState and URI hashes.</li>
<li>Fast load times between pages e.g. intermediate pages in a long form.</li>
<li>Help enable responsive/reactive services that are more resilient to failure on the server.</li>
<li>Work particularly well for ‘application’ style websites i.e. those that mimic thick-client behaviour (Gmail for example).</li>
</ul>
<br/><br/>
Disadvantages:
<ul>
<li>Clients must enable JavaScript, although in most environments this is now a given.</li>
<li>Deep linking/bookmarking into applications can be more difficult.</li>
<li>Search engine optimisation (SEO) can be compromised as historically search engines have not been as good at executing JavaScript code to crawl websites as they have been following hypertext links.</li>
<li>Consideration may need to be given to development team makeup and skills since they often introduce a different technology/language into the stack.</li>
<li>Performance monitoring can be compromised since most tools are designed to measure things like network round trip time, page load time, etc, that map better to full page reloads on each user interaction.</li>
<li>Penetration testing using automated crawling tools suffers from some of the same problems as SEO i.e. difficulty identifying the links to follow.</li>
<li>Can end up bundling and downloading an entire website in one go on first page load resulting in long load times.</li>
<li>Refactoring from one SPA framework to another (or to another version e.g. Angular v1 to v2) becomes big-bang.</li>
<li>Business logic can end up in the client JavaScript which means it can't be wrapped and reused by an API (ref: Duncan Crawford HMRC MDTP decision on SPAs).</li>
</ul>
