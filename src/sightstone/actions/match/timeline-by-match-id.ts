/*
    The FetchSummoner class extends Action and provides a way to get all relevant
    summoner data from the Riot API and add it to data.
*/

import Action from '../action';
import { MatchTimelineInterface } from '../../interfaces/dto';
import { ENDPOINTS, Region } from '../../../riot-api';
import SubmoduleMapInterface from '../../interfaces/submodule-map';

class FetchTimelineByMatchID extends Action {
    private server: Region;

    private matchId: number;

    constructor(SubmoduleMap: SubmoduleMapInterface, server: string, matchId: number) {
        super(SubmoduleMap);
        // Region check
        if (!(<any>Object).values(Region).includes(server.toLowerCase())) {
            throw new Error('[sightstone]: Invalid server region provided.');
        }

        this.server = server as Region; // We've already performed a type check
        this.matchId = matchId;
    }

    public async run(): Promise<MatchTimelineInterface> {
        try {
            await this.waitForRateLimit(this.server);
            await this.incrementRateLimit(this.server);
            const { data: timelineData }: any = await this.RiotAPI.request(ENDPOINTS.MATCH.TIMELINE.MATCH_ID, { server: this.server, 'match-id': this.matchId }).get();

            return timelineData as MatchTimelineInterface;
        } catch (e) {
            if (e.response?.status) {
                if (e.response.status === 403) {
                    throw new Error('[sightstone]: The provided Riot API key is invalid or has expired. Please verify its authenticity. (sc-403)');
                } else {
                    throw new Error(`[sightstone]: MatchTimeline data fetch failed with status code ${e.response.status}`);
                }
            }

            throw e;
        }
    }
}

export default FetchTimelineByMatchID;
