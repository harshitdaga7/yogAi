import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs'
// Register one of the TF.js backends.
import '@tensorflow/tfjs-backend-webgl';

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}
const graph = {

    4:[2,0,1,3],
    10 : [10,8,6,5,7,9],
    6: [12,14,16],
    5 : [11,13,15],
    12: [11],
}

const posedict = {
    
    0:'downdog',
    1:'goddess',
    2:'plank',
    3:'tree',
    4:'warrior2'
}

const WIDTH = 640
const HEIGHT = 480
//let _pose_select = document.getElementById('pose_select')
//let _help_text_head = document.getElementById('help_text_head')
//let _help_text_content = document.getElementById('help_text_content')
//let _help_img = document.getElementById('help_img')
//let _start_button = document.getElementById('start_button')
//let _stop_button = document.getElementById('stop_button')
const el = document.getElementById('video_element')
const detectorConfig = {modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING};
const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
const model = await tf.loadLayersModel('https://raw.githubusercontent.com/harshitdaga7/tfjs_model_yoga/main/model.json');
let cam = null;
var canvas = document.getElementById ('my_canvas');    // access the canvas object
var context = canvas.getContext ('2d'); 
var keep_running = false                           // access the canvas context
context.translate(canvas.width, 0);
context.scale(-1, 1)
if(detector && model)
{
    document.getElementById('loading').style.display = "none";
    document.getElementById('loaded').style.display = "initial";
}

let live_view = document.getElementById('liveView')
let pose_select = document.getElementById('pose_select')
let help_text_head = document.getElementById('help_text_head')
let help_text_content = document.getElementById('help_text_content')
let help_img = document.getElementById('help_img')
let start_button = document.getElementById('start_button')
let stop_button = document.getElementById('stop_button')
let my_canvas = document.getElementById('my_canvas')
let my_posedict = {
    0: {
         'head' : 'downdog',
         'content' : "One of yoga's most widely recognized poses, Downward-Facing Dog Pose, called Adho Mukha Svanasana in Sanskrit, works to strengthen the core and improve circulation. This rejuvenating pose works to provide a delicious, full-body stretch.",
         'img_path' : "assets/img/downward_dog.gif" 
        },
    1:{
         'head' : 'goddess',
         'content' : "Utkata Konasana (Goddess Pose), also referred to as the Fierce Angle Pose, is an empowering, intermediate standing level pose. The Goddess Pose (Utkata Konasana) can also be part of yoga sequences intended for hips, the chest",
         'img_path' : "https://64.media.tumblr.com/72dff3ef8380328ac9bf3effac9eb55d/tumblr_o3j8h2su5B1rysr6eo1_400.gifv" 
        },
    2:{
         'head' : 'plank',
         'content' : "Nurture your love-hate relationship with Plank Pose. A beginner's best friend, it's the perfect precursor to more challenging arm balances.",
         'img_path' : "https://media2.giphy.com/media/2UqZvQq4p9DjTBDVRc/giphy.gif" 
        },
    3:{
         'head' : 'tree',
         'content' : "Tree Pose, called Vrksasana in Sanskrit, establishes strength and balance in the legs, and helps you feel centered, steady, and grounded.",
         'img_path' : "https://www.sheknows.com/wp-content/uploads/2018/08/gijnkznlgwzt0bcb1bgp.gif" 
        },
    4:{
         'head' : 'warrior II',
         'content' : "Named for a fierce warrior, an incarnation of Shiva, this version of Warrior Pose increases stamina.",
         'img_path' : "https://www.verywellfit.com/thmb/I1bZw-lS3uLWsoz3Us9QC1A19Mg=/1500x1000/filters:fill(FFDB5D,1)/Verywell-03-3567198-Warrior2-598a10d4d963ac0011fc9d72.gif" 
        }
}

pose_select.addEventListener('change',handle_pose_select)
start_button.addEventListener('click',handle_start_button)
stop_button.addEventListener('click', handle_stop_button)

function handle_pose_select()
{
    let id  =  pose_select.options.selectedIndex

    if (cam)
    {
        cam.stop()
    }

    if (id == 0)
    {
        live_view.style.display = "none"
        help_text_head.innerHTML = "Please Select Pose"
        help_text_content.innerHTML = "Please select some pose from dropdown to start"
        help_img.style.display = "initial"
        help_img.src = "assets/img/yoga_logo.png"
        start_button.style.display = "none"
        stop_button.style.display = "none"
        my_canvas.style.visibility = "hidden"
        keep_running = false;
    }
    else if (id <= 5){
        live_view.style.display = "none"
        help_text_head.innerHTML = my_posedict[id-1].head
        help_text_content.innerHTML = my_posedict[id-1].content
        help_img.style.display = "initial"
        help_img.src = my_posedict[id-1].img_path
        start_button.style.display = "initial"
        stop_button.style.display = "none"
        my_canvas.style.visibility = "hidden"
        keep_running = false;
    }
    else
    {
        alert('Something is wrong')
    }
}

async function handle_start_button()
{
     let id =  pose_select.options.selectedIndex

     if(id == 0)
     {
         alert('hacker alert, this is not possible')
     }
     else
     {
       live_view.style.display = "initial"
       start_button.style.display = "none"
       help_img.style.display = "none"
       stop_button.style.display = "initial"
       help_text_content.innerHTML = `Loading ${my_posedict[id-1].head} models and setting cam`
       my_canvas.style.visibility = "visible"
       keep_running = true;
       await start_inference(id);
     }
     
}

function handle_stop_button()
{
    if (cam)
    {
        cam.stop()
    }
        live_view.style.display = "none"
        pose_select.options.selectedIndex = 0;
        keep_running = false;
        help_text_head.innerHTML = "Please Select Pose"
        help_text_content.innerHTML = "Please select some pose from dropdown to start"
        help_img.style.display = "initial"
        help_img.src = "assets/img/yoga_logo.png"
        start_button.style.display = "none"
        stop_button.style.display = "none"
        my_canvas.style.visibility = "hidden"

}


// function handle_stop_button()
// {
//     if (cam)
//     {
//         cam.stop()
//     }
//     handle_stop_button_1();
// }

async function start_inference(id)
{
    cam = await tf.data.webcam(el)
    
    if(!cam) {
        alert('Webcam not acessible')
        handle_stop_button()
        return;
    }
    if((!model) || (!detector)) {
        alert('could not load model, check your internet connection')
        handle_stop_button()
        return;
    }

    help_text_content.innerHTML = "Successfully loaded"

    while(keep_running)
    {
        const img = await cam.capture()
        context.save()
        context.drawImage(el,0,0)
        const poses = await detector.estimatePoses(img);
        // console.log('printing poses')
        //console.log(poses)



        let keypoints = null
        if(poses && poses[0])
        {
            keypoints = poses[0]['keypoints']
        }
        else
        {
            help_text_head.innerHTML = "ALERT , PLEASE BE IN FRONT OF CAMERA"
            help_text_content.innerHTML = "Hey , I cannot see you, can you please show your face :)"

        }
        //console.log(keypoints)

        if(keypoints)
        {
            let norm_keypoints = [];
            let cnt = 0;

            for (let k in graph) {

                context.strokeStyle = '#00ff04'; // set the strokeStyle color to 'navy' (for the stroke() call below)
                context.lineWidth = 2.0;      // set the line width to 3 pixels
                context.beginPath();          // start a new path
                context.moveTo (keypoints[k]['x'],keypoints[k]['y']);
                
                for(let i of graph[k])
                {
                    if(keypoints[i]['score'] >= 0.4)
                    {
                        context.lineTo (keypoints[i]['x'],keypoints[i]['y']);
                        cnt+=1;
                    }
                    else
                    {
                        context.moveTo(keypoints[i]['x'],keypoints[i]['y']);
                    }
                }     
                context.stroke();             
            }

            for(let k in keypoints)
            {   
                norm_keypoints.push((keypoints[k].y)/HEIGHT)
                norm_keypoints.push((keypoints[k].x)/WIDTH)

                //console.log('normalizing')
            }

            if(norm_keypoints)
            {
                if(cnt < 10)
                {
                    help_text_head.innerHTML = "Hey you are too close"
                    help_text_content.innerHTML = "I wont be able to detect any poses if you are too close to the camers :)"
                    
                }
                else
                {
                    norm_keypoints = tf.tensor([norm_keypoints])
                    //console.log(norm_keypoints)

                    let pred = model.predict(norm_keypoints).arraySync()[0]

                    if(pred)
                    {
                        //console.log(pred)
                        let x = indexOfMax(pred)
                        // output.innerHTML = posedict[x]
                        // console.log(x,posedict[x])
                        // console.log(tf.argMax(pred))

                        if(x != id-1)
                        {
                                
                            help_text_head.innerHTML = `WRONG POSE DO ${posedict[id-1]} NOT ${posedict[x]}`
                            help_text_content.innerHTML = `You are doing wrong pose, you are supposed to do ${posedict[id-1]} not ${posedict[x]}`

                        }
                        else
                        {
                            help_text_head.innerHTML = `GOOD JOB PRACTICING ${posedict[x]} `
                            help_text_content.innerHTML = "Great job, now you can keep practising or try other poses."
                        }

                    }

                }


                    //console.log(tf.argMax(pred))
            }



        }

        img.dispose()
        context.restore()
        // break
        await tf.nextFrame()
    }

    return;

}
// while(true)
// {
//     const img = await cam.capture()
//     // img.print();
//     context.save()
//     context.drawImage(el,0,0)
//     const poses = await detector.estimatePoses(img);
//     console.log('printing poses')
//     //console.log(poses)

//     let keypoints = null
//     if(poses && poses[0])
//     {
//         keypoints = poses[0]['keypoints']
//     }
//     //console.log(keypoints)

//     if(keypoints)
//     {
//         let norm_keypoints = [];

//         for (let k in graph) {

//             context.strokeStyle = '#00ff04'; // set the strokeStyle color to 'navy' (for the stroke() call below)
//             context.lineWidth = 2.0;      // set the line width to 3 pixels
//             context.beginPath();          // start a new path
//             context.moveTo (keypoints[k]['x'],keypoints[k]['y']);
            
//             for(let i of graph[k])
//             {
//                 if(keypoints[i]['score'] >= 0.4)
//                 {
//                     context.lineTo (keypoints[i]['x'],keypoints[i]['y']);
//                 }
//                 else
//                 {
//                     context.moveTo(keypoints[i]['x'],keypoints[i]['y']);
//                 }
//             }     
//             context.stroke();             
//         }

//         for(let k in keypoints)
//         {   
//             norm_keypoints.push((keypoints[k].y)/HEIGHT)
//             norm_keypoints.push((keypoints[k].x)/WIDTH)

//             //console.log('normalizing')
//         }

//         if(norm_keypoints)
//         {
//             norm_keypoints = tf.tensor([norm_keypoints])
//             //console.log(norm_keypoints)

//             let pred = model.predict(norm_keypoints).arraySync()[0]

//             if(pred)
//             {
//                 //console.log(pred)
//                 let x = indexOfMax(pred)
//                 output.innerHTML = posedict[x]
//                 // console.log(x,posedict[x])
//                 // console.log(tf.argMax(pred))
//             }


//             //console.log(tf.argMax(pred))
//         }



//     }

//     img.dispose()
//     context.restore()
//     // break
//     await tf.nextFrame()
// }