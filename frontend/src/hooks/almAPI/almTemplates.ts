const almProblemAnalysisSummaryTemplate =  `Root Cause Analysis Summary
                                            -----------------------------------------
                                            Root Cause:
                                            <Specify the root cause and where the deviation has occurred (requirements, implementation, test method)>

                                            Dependencies:
                                            <Are there any dependencies or interactions with other features/functions/teams that need to be considered?>

                                            Corrective Actions:
                                            <Specify what is required to fix the identified problem (update requirements, implementation, test method)>

                                            Impacts:
                                            <What impact does the problem have on the functionality and user experience if not fixed?>

                                            Recommendations:
                                            <Indicate to CCB what should be done to plan the problem ticket (fix immediately, delay for future release, reject ticket, etc.)>

                                            Reason for delay of analysis:
                                            <Only to be given if analysis cannot be finished 2 weeks after creation of the Issue. If analysis is postponed this must be given 2 weeks after creation of the Issue>

                                            Effort Estimate Summary:
                                            SYS: ? hrs
                                            SW: ? hrs
                                            V&V: ? hrs`;

export {almProblemAnalysisSummaryTemplate};
