# MyCashflow 2018 email theme

MyCashflow 2018 email theme is the default theme used in MyCashflow e-commerce
platform.

The theme is based on the [Foundation for Emails](https://foundation.zurb.com/emails)
framework. See also the [Foundation for Emails documentation](https://foundation.zurb.com/emails/docs/).


## Installation

Download the email theme files and open the email theme’s root directory in your
computer’s terminal. All commands should be executed in the email theme’s root
directory.


### Creating an email theme

First, you must install the tools you’ll need to develop an email theme. To
install the tools, use the following command:

```
npm install
```

### Developing an email theme

Development takes place in the email theme’s root directory, in which you can
edit the email theme to suit your needs by modifying the files in the `src`
directory.

**Note** that you can also include the SASS configuration file
`styles/scss/common/_variables.scss` based on Barebones directly in the email
theme.


### Converting an email theme

The theme conversion command converts the email theme so that it is ready to use
in your MyCashflow store. You can move the files from the `dist` directory to
your online store’s directory `themes/email/theme-name`.

```
npm run build
```

### Converting an email theme and tracking changes

The command tracks changes made in the email theme and converts the theme after
each change. The command automatically opens the preview of the email theme in
the browser. **Note that the contents of Interface tags is not printed in the
preview.**

```
npm run watch
```

## Links

* [MyCashflow e-commerce platform](https://www.mycashflow.fi/)
* [Email theme source code](https://github.com/MyCashflow/Default-Email-Templates/)
* [The Foundation for Emails documentation](https://foundation.zurb.com/emails/docs/)
