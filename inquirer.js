const inquirer = require('inquirer');

module.exports = {
    askSpotifyCreds: () => {
        const questions = [
            {
                name: 'clientId',
                type: 'input',
                message: 'Please enter your client id from https://developer.spotify.com/dashboard/applications',
                validate: function ( value ) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter your client id';
                    }
                }
            },
            {
                name: 'clientSecret',
                type: 'input',
                message: 'Please enter your client secret from https://developer.spotify.com/dashboard/applications',
                validate: function ( value ) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter your client secret';
                    }
                }
            }
        ];
        return inquirer.prompt(questions);
    },
    askAuthCred: (ipAddr) => {
        const questions = [
            {
                name: 'code',
                type: 'input',
                message: `Please enter your code from ${ipAddr}`,
                validate: function ( value ) {
                    if (value.length) {
                        return true;
                    } else {
                        return 'Please enter your Authorization Code';
                    }
                }
            },
        ];
        return inquirer.prompt(questions);
    },
};