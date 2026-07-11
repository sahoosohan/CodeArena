import { useEffect, useState } from "react";
import { getAllSubmissionByCurrentUserForProblem } from "../actions";

type SubmissionHistory = NonNullable<
  Awaited<ReturnType<typeof getAllSubmissionByCurrentUserForProblem>>["data"]
>;

export function useSubmissionHistory(id:string){
     const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistory>([]);


     useEffect(()=>{
        const fetchSubmissionHistory  = async()=>{
            try {
                const response = await getAllSubmissionByCurrentUserForProblem(id);
                if(response.success && response.data){
                      setSubmissionHistory(response.data);
                }
            } catch (error) {
                 console.error('Error fetching submission history:', error);
            }
        }

        fetchSubmissionHistory()
     },[id])

     return {
        submissionHistory
     }
}
