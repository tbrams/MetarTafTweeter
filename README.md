# Automated Metar and Taf tweet bot
This is the code I am using for my [automated twitter bot](https://twitter.com/TBR_bot) serving updates for pilots interested in the meteorological conditions for Copenhagen Airport, Denmark - and keep completely up to date with these weather briefings.

<p align="center">
<img width="603" alt="screenshot 2018-08-10 14 36 56" src="https://user-images.githubusercontent.com/3058746/47308989-84884780-d633-11e8-8f50-da47dbe01fad.png">
</p>

Although Twitter decided to change the rules on how we mortals may build these bots, the service running on twitter continues to work even though I accidentally introduced a javascript `let` statement August 11th 2018 and brought it down for a while until I discovered what was going on. 

However, you may also want to run this locally on your own computer and benefit from access to the latest updated weather info on any airport in the world served by aviationweather.gov 


The program is designed to be run from a cron script like this

```
ubuntu@ip-172-31-19-97:~$ crontab -l
#* * * * * /usr/bin/uptime > /tmp/uptime
# Edit this file to introduce tasks to be run by cron.
# 
# Each task to run has to be defined through a single line
# indicating with different fields when the task will be run
# and what command to run for the task
# 
# To define the time you can provide concrete values for
# minute (m), hour (h), day of month (dom), month (mon),
# and day of week (dow) or use '*' in these fields (for 'any').# 
# Notice that tasks will be started based on the cron's system
# daemon's notion of time and timezones.
# 
# Output of the crontab jobs (including errors) is sent through
# email to the user the crontab file belongs to (unless redirected).
# 
# For example, you can run a backup of all your user accounts
# at 5 a.m every week with:
# 0 5 * * 1 tar -zcf /var/backups/home.tgz /home/
# 
# For more information see the manual pages of crontab(5) and cron(8)
# 
# m h  dom mon dow   command
# Check and tweet EKCH metar every 5 minutes
*/5 * * * * /home/ubuntu/getMetar > /tmp/getMetar.log 2>&1
*/5 * * * * ./getTaf > /tmp/getTaf.log 2>&1
ubuntu@ip-172-31-19-97:~$ 
```
Where `getMetar` is a simple batch file like this

```
#!/bin/bash
node ./metar/app ekch metar
```

And `getTaf` is 

```
#!/bin/bash
node ./metar/app ekch taf
```
