## Overview

A Rally App for planning iterations and releases. Much like Rally's Plan->Plan page, but with a hierarchy and a prettier UI.
Built as part of the 2012 RallyON! Hackathon.


See a screencast here: http://screencast.com/t/VaazH05Ryas

To use in Rally, copy the content of [App.html](https://github.com/downloads/RallyCommunity/PlanPlanPalatable/App.html.zip) into a "Custom HTML" app in Rally.
	
To modify and rebuild, use these rake tasks:

	rake build #builds App.html as a deployable version of this app. Copy and paste the content into a custom HTML app in Rally.
	rake debug #builds App-debug.html for local development

## License

"Plan Iterations and Releases" is released under the MIT license.  See the file LICENSE for the full text.