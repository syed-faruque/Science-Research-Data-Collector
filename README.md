# Science Research Data Collector

You can use this website to keep track of data collected by multiple people. This data may relate to scientific research, but by no means is it limited to that.

# Inspiration

My friend Haris knows I am good at programming applications, so he asked me if I could create one that would allow him to efficiently manage data when working on his future group project. He explained that it would be too messy to try and organize data via google docs or word document, and he needed a system where each group member could simultaneously log observations and experimental data, and one that provided him the ability to access the logs of everyone in the group.

# How I Built It

To create this website, I used HTML forms to allow users to submit data. A Node.Js server on the backend will then handle those requests and store the data in an SQL database I set up. Outside of HTML, the frontend of my site was styled using CSS, and in order to dynamically display data submitted by users, I used vanilla javascript to fetch data from the server-side. 

# How It Works

Through my website, a person can create his own account and then login to access a logbook. Within this logbook, the user can enter any data he/she collected during his/her research process. Multiple people can do this at the same time, and my node server will be able to distinguish between requests made by each person. There will be a fixed administrator that can then access the logs of any user who signed up.
