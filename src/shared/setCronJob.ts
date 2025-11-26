
import cron from 'node-cron';

const setCronJob = ( schedule: string, runFunction: () => void, stopAfterExecution: boolean = true ) => {
    const cronJob = cron.schedule(schedule, () => {
        runFunction();
        if (stopAfterExecution) cronJob.stop();
        
    });

    cronJob.start();
};

export default setCronJob;

