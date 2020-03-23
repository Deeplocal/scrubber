# Scrubber!

![headline](docs/headline.png)

Social distancing at home but wishing you were getting down at the club? Tired of the 20 seconds of lathering feelings like the longest 20 seconds of your life? Looking for a project to do in #quarentine? No worries— Scrubber's got you covered!

Scrubber is your handwashing soundtrack— 20 seconds of music selected right from your most played Spotify tracks of the week. All you need is a soap dispenser, a Spotify account, and the electronic parts listed below. Check out more of this project at Deeplocal.com/scrubber, and keep reading to learn how to build your own.

## Project Information

- **Estimated time to assemble:** 4 hours
- **Difficulty:** Beginner/Intermediate 
- **Cost:** About $30

**Features:**

- Pump-triggered music that times your hand washing 
- Simple parts that you adjust for whatever soap dispner you use
- ... third thing



## What You’ll Find

- software/
  - rpi/

This repo contains all the code and documentation you'll need to get your Scrubber up and running!

## What You'll Need

![Image of a workspace, including laptop soap dispensers, and assorted electrical part](docs/workspace.jpeg)

Before you get started, you should have some basic knowledge of command line linux and soldering. You'll also need the parts and tools listed below.

### Electrical Parts

- Raspberry Pi Zero W
- Adafruit Speaker Bonnet & Speaker
- ~1-2ft of thin wire (aroudn 22awg)
- A few inches of copper tape
- Battery pack (optional)

Most of these parts can we swapped for what you have access to— the speaker bonnet can be replaced with a similar audio pHat or AIY hat, 

and the copper tape can be replaced with aluminum foil and super glue.

### Tools

- Tiny screwdrivers
- X-ACTO knife
- Soldering Iron
- Wire cutters
- Wire strippers
- Tools to modify your soap dispenser (scissors, drill, etc,)

## Assembly

Let's get down to it— start by connecting your Pi to your wireless network, if you don’t know how, here’s a great guide (link). Make sure you can SSH into your pi and can find you Pi’s local IP address.

### Hardware

![Untitled Sketch_bb4](docs/parts.png)

1. Power down your Pi

2. Press the Adafruit Sound Bonnet onto the Pi's headers

3. Locate Pin 5 and ground **on the sound bonnet** and solder ~6in of your thin wire to each

4. [Optional] Attach a battery pack— we did this but you definitely don’t need to. 

   ![Untitled Sketch_bb6](docs/assem.png)

Once you’re all put together, We’re ready to head to software!

### Software

1. On your computer (not the Pi), head to Spotify [dashboard](http://link). 

2. Click *Create an app* and call it *Scrubber,* and set the description to scrubber. Select “Speaker” on the checklist, and then click next— assuming you're using this for a non-commerical application, click non-commerical, then read the tems and conditions, check the boxes, and hit submit. You’ll now be on a page with see you Client ID

3. Note down your Client ID and your Client Secret (we’ll need those in a bit!)

4. Click *edit settings,* then add http://<Your Raspberry Pi’s ip>:5000 to the redirect URIs. So if your Pi IP was 192.168.1.232, you'd enter http://192.168.1.232:5000 and hit add then save.![image-20200322165950194](/Users/taylortabb/Library/Application Support/typora-user-images/image-20200322165950194.png) 

5. SSH into your Pi, and create a directory to house Scrubber in.

   `mkdir Projects`

6. Navigate into the directory  

   `cd Projects` 

7. Set up the Speaker Bonnet with Adafruit's installer— yup, you do actually have to run the script and reboot twice. 

   1. `curl -sS https://raw.githubusercontent.com/adafruit/Raspberry-Pi-Installer-Scripts/master/i2samp.sh | bash` 
   2. `sudo reboot now ` 
   3. `curl -sS https://raw.githubusercontent.com/adafruit/Raspberry-Pi-Installer-Scripts/master/i2samp.sh | bash` 
   4. `sudo reboot now ` 

4. Test out the speaker bonnet 

   `speaker-test -c2 --test=wav -w /usr/share/sounds/alsa/Front_Center.wav`

   and hit ctrl+c to exit. If you don't hear audio, check out Adfruit's [documentation](https://learn.adafruit.com/adafruit-speaker-bonnet-for-raspberry-pi/raspberry-pi-usage) for troubleshooting

5. Ensure you're in your Projects folder, and clone this repository

   `git clone....`

6. Install Node and NPM (we're using version 10.15.2, but any recent version should be fine)

   `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash` 

   `nvm install node` 

1. Enter the scrubber directory

   `cd scrubber` 

11. install all the relevant packages (this may take a while, but don't worry— consider washing your hands while you pass the time)

    `npm i` 

12. Start the script by typing `node index`, then wait for instructions to appear in your command line to link your Spotify account

    I. Paste your Client ID from earlier, and hit enter

    II. Paste your Client Secret from earlier, and hit enter

    III. In your browser, go to http://<Your Raspberry Pi’s ip>:5000 and hit Log in with Spotify 

    IV. Copy the code from your browser and enter it into your SSH session when requested— then wait (several minutes) for the download to complete— you'll hear a 20 second clip play when it's all been proccessed.

13. Test the system by touching PIN5 and Ground wire! You should hear 20 seconds of audio

    #### Running on Boot

    After we've run the script for the first time, we can optionally set the script to run on boot— this means you don't have to SSH into Scrubber everytime you power up. 

    Edit the file `/etc/rc.local` 

    ```
    sudo nano /etc/rc.local
    ```

    Add this line: `cd /home/pi/Projects/scrubber && node index.js` just above the `exit 0` at the end of the file. Then save the file and close it. And reboot your pi with `sudo reboot now`

    

##Putting it all together

Now it’s time to put it all together— there’s a million different soap dispensers out there, so we’ll show you one simple way to trigger your music that can be adapted to almost any type of dispenser. We want the pump to trigger the audio so we’ll be using copper tape (or glue and aluminum foil) to make the pump act just like a button.

1. Grab your copper tape, and place two strips on the pump just such that they make contact when the bottle is pressed, check out ours in the images.

2. Gently solder those ground and pin __ wires to the copper tape— now, when the two copper strips make contact, the Pi will perceive a button press.

   ![solder](docs/solder.gif)

And that’s it! You’ve got your very own Scrubber! 🧽 Smash that pump for 20 seconds of hand washing dance party energy.

## Notes

Scrubber was concepted, designed, build, and launched during the week of 3/16/20. This project presented new and interesting challegnes due to Deeplocal staff working from home. Part of this project was an exploration of remote creative collaboration for physical projects— Scrubber was fabricated in home makerspaces across Pittsburgh, with remote support from our creative and engineering teams. 

The team behind scrubber includes Adnan Aga, Taylor Tabb, Caroline Fisher, Colin Miller, Erin Pridemore, and Matthew Pegula.
