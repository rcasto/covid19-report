# Notes

- ~~Add deltas for all values from previous day's report~~
    - ~~Will need to generate a seed initial prev value~~
    - ~~Will need to develop the routine to calculate deltas~~
    - ~~Will need to add these results to rendered table output~~
- ~~Redesign, consolidate sorting filters~~
    - ~~Sort by location (bullet with cross html entity)~~
    - ~~Sort by # of confirmed cases (default - checkmark)~~
    - ~~Sort by # of deaths (-)~~
    - ~~Sorty by # of recovered cases (+)~~
- Add light/dark mode toggle
    - ~~Add dark theme~~
    - ~~Default to user set system theme~~
    - Add toggle between modes
    - Persist choice to local storage

## Filtering via multiple dimensions

It would be interesting to filter by multiple dimensions.

Stepping back and looking at what I have already, the default view, is actually sorted by more than just the count of confirmed cases. It is also inherently sorted by the unique combination of country/region and province/state.

This essentially makes each table record in the table itself unique. If I removed one of these requirements or filters though, such as the province/state. Then, the province/state would become no longer part of the unique identity of each record. It would now just be the country/region + count of confirmed cases. This would lead to a table filtered such that each country/region is grouped together and these individual groups are sorted by the # of confirmed cases.

In the original default case, a group was specified in such a way that it mapped to an individual record, not many records.

