/****
 * Generates README file by using `description` property of each API action defined in `apiActions` dir
 * This is a developer file and will not affect the user. 
 */

const fs = require('fs');
const path = require('path');

try {
    const zombiesEndPoints = require('../apiActions/zombieActions')();
    const zombieItemsEndPoints = require('../apiActions/zombieItemsActions')();

    const readmeSource = fs
        .readFileSync(path.resolve(__dirname, 'readme_source.md'), 'utf-8')
        .toString();

    function generateRouteMarkDown(action) {
        const heading = `#### \`${action.HTTPVerb.toUpperCase()}\` \`${action.route}\``;
        const body = action.description;
        return [heading, body].join('\n');
    }

    const zombiesSectionHeading = `### Zombies Endpoint`;
    const zombiesSectionParagraphs = zombiesEndPoints
        .map(generateRouteMarkDown)
        .join('\n');

    const zombiesItemsSectionHeading = `### Zombie Items Endpoints`;
    const ItemsSectionParagraphs = zombieItemsEndPoints
        .map(generateRouteMarkDown)
        .join('\n');

    const sections = [
        zombiesSectionHeading,
        zombiesSectionParagraphs,
        zombiesItemsSectionHeading,
        ItemsSectionParagraphs
    ].join('\n\n');

    const readyReadme = readmeSource.replace(
        'REPLACE_ME_WITH_API_DOCS',
        sections
    );

    fs.writeFileSync(
        path.resolve(__dirname, '..', 'README.md'),
        readyReadme,
        'utf-8'
    );

    console.log('Docs generated successfully!');
} catch (error) {
    console.error(error);
    process.exit(1);
}
