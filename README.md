# covid19-report
Daily updates on total covid-19 cases using [data provided by Johns Hopkins CSSE](https://github.com/CSSEGISandData/COVID-19).  
Get a glance quickly at the number of cases that are near you.

Data is synced every few minutes to quickly pick up when a new report is made available.

## Latest Report API
If you want to get the raw report data yourself you can hit:  
https://covid19-report.today/api/latest-report (<a download href="https://covid19-report.today/api/latest-report">Download</a>)
```json
[["Province/State","Country/Region","Confirmed","Deaths","Recovered","Lat","Long"],["Hubei","Mainland China","67466","2902","40592","30.9756","112.2707"],["","South Korea","6088","35","41","36.0","128.0"],["","Italy","3858","148","414","43.0","12.0"],["","Iran","3513","107","739","32.0","53.0"],["Guangdong","Mainland China","1351","7","1181","23.3417","113.4244"],["Henan","Mainland China","1272","22","1239","33.882020000000004","113.61399999999999"],["Zhejiang","Mainland China","1215","1","1124","29.1832","120.0934"],["Hunan","Mainland China","1018","4","938","27.6104","111.7088"],["Anhui","Mainland China","990","6","970","31.8257","117.2264"],["Jiangxi","Mainland China","935","1","901","27.614","115.7221"],["Shandong","Mainland China","758","6","578","36.3427","118.1498"],["Diamond Princess cruise ship","Others","706","6","10","35.4437","139.638"],["Jiangsu","Mainland China","631","0","583","32.9711","119.455"],["Chongqing","Mainland China","576","6","512","30.0572","107.874"],["Sichuan","Mainland China","539","3","425","30.6171","102.7103"],["","Germany","482","0","16","51.0","9.0"],["Heilongjiang","Mainland China","481","13","379","47.861999999999995","127.7615"],["Beijing","Mainland China","418","8","297","40.1824","116.4142"],["","France","377","6","12","47.0","2.0"],["","Japan","360","6","43","36.0","138.0"],["Shanghai","Mainland China","339","3","303","31.201999999999998","121.4491"],["Hebei","Mainland China","318","6","304","38.0428","114.5149"],["Fujian","Mainland China","296","1","277","26.0789","117.9874"],["","Spain","259","3","2","40.0","-4.0"],["Guangxi","Mainland China","252","2","214","23.8298","108.7881"],["Shaanxi","Mainland China","245","1","224","35.1917","108.8701"],["Yunnan","Mainland China","174","2","169","24.974","101.48700000000001"],["Hainan","Mainland China","168","6","158","19.1959","109.7453"],["Guizhou","Mainland China","146","2","114","26.8154","106.8748"],["Tianjin","Mainland China","136","3","128","39.3054","117.323"],["Shanxi","Mainland China","133","0","126","37.5777","112.2922"],["Liaoning","Mainland China","125","1","106","41.2956","122.6085"],["","Singapore","117","0","78","1.2833","103.8333"],["","UK","115","1","8","55.0","-3.0"],["","Switzerland","114","1","3","46.8182","8.2275"],["Hong Kong","Hong Kong","105","2","43","22.3","114.2"],["Gansu","Mainland China","102","2","87","36.0611","103.8343"],["","Sweden","94","0","0","63.0","16.0"],["Jilin","Mainland China","93","1","88","43.6661","126.1923"],["","Norway","87","0","0","60.472","8.4689"],["","Netherlands","82","0","0","52.1326","5.2913"],["Xinjiang","Mainland China","76","3","70","41.1129","85.2401"],["Inner Mongolia","Mainland China","75","1","65","44.0935","113.9448"],["Ningxia","Mainland China","75","0","69","37.2692","106.1655"],["","Kuwait","58","0","0","29.5","47.75"],["","Bahrain","55","0","0","26.0275","50.55"],["King County, WA","US","51","10","1","47.6062","-122.3321"],["","Belgium","50","0","1","50.8333","4.0"],["","Malaysia","50","0","22","2.5","112.5"],["","Thailand","47","1","31","15.0","101.0"],["Unassigned Location (From Diamond Princess)","US","45","0","0","35.4437","139.638"],["Taiwan","Taiwan","44","1","12","23.7","121.0"],["","Austria","41","0","0","47.5162","14.5501"],["","Iraq","35","2","0","33.0","44.0"],["","Iceland","34","0","0","64.9631","-19.0208"],["","Greece","31","0","0","39.0742","21.8243"],["","India","30","0","3","21.0","78.0"],["","United Arab Emirates","29","0","5","24.0","54.0"],["New South Wales","Australia","22","1","4","-33.8688","151.2093"],["Toronto, ON","Canada","21","0","2","43.6532","-79.3832"],["","San Marino","21","1","0","43.9424","12.4578"],["Santa Clara, CA","US","20","0","1","37.3541","-121.9552"],["Qinghai","Mainland China","18","0","18","35.7452","95.9956"],["Snohomish County, WA","US","18","1","0","48.033","-121.8339"],["Westchester County, NY","US","18","0","0","41.122","-73.7949"],["","Israel","16","0","1","31.0","35.0"],["","Lebanon","16","0","1","33.8547","35.8623"],["","Oman","16","0","2","21.0","57.0"],["","Vietnam","16","0","16","16.0","108.0"],["Queensland","Australia","13","0","8","-28.0167","153.4"],["British Columbia","Canada","13","0","3","49.2827","-123.1207"],["","Ecuador","13","0","0","-1.8312","-78.1834"],["","Algeria","12","0","0","28.0339","1.6596"],["","Czech Republic","12","0","0","49.8175","15.472999999999999"],["","Finland","12","0","1","64.0","26.0"],["Los Angeles, CA","US","11","0","0","34.0522","-118.2437"],["Victoria","Australia","10","0","7","-37.8136","144.9631"],["","Croatia","10","0","0","45.1","15.2"],["","Denmark","10","0","0","56.2639","9.5018"],["Macau","Macau","10","0","9","22.1667","113.55"],["","Portugal","8","0","0","39.3999","-8.2245"],["","Qatar","8","0","0","25.3548","51.1839"],["","Azerbaijan","6","0","0","40.1431","47.5769"],["","Belarus","6","0","0","53.7098","27.9534"],["","Ireland","6","0","0","53.1424","-7.6921"],["","Romania","6","0","1","45.9432","24.9668"],["South Australia","Australia","5","0","2","-34.9285","138.6007"],["","Mexico","5","0","1","23.6345","-102.5528"],["","Pakistan","5","0","0","30.3753","69.3451"],["","Saudi Arabia","5","0","0","24.0","45.0"],["Cook County, IL","US","5","0","2","41.7377","-87.6976"],["","Brazil","4","0","0","-14.235","-51.9253"],["","Chile","4","0","0","-35.6751","-71.543"],["","Georgia","4","0","0","42.3154","43.3569"],["","Palestine","4","0","0","31.9522","35.2332"],["","Russia","4","0","2","60.0","90.0"],["","Senegal","4","0","0","14.4974","-14.4524"],["New York City, NY","US","4","0","0","40.7128","-74.006"],["Western Australia","Australia","3","1","0","-31.9505","115.8605"],["","Egypt","3","0","1","26.0","30.0"],["","Estonia","3","0","0","58.5953","25.0136"],["","New Zealand","3","0","0","-40.9006","174.886"],["","Philippines","3","1","1","13.0","122.0"],["","Saint Barthelemy","3","0","0","17.9","-62.8333"],["Orange County, CA","US","3","0","0","33.7879","-117.8531"],["San Diego County, CA","US","3","0","1","32.7157","-117.1611"],["","Bosnia and Herzegovina","2","0","0","43.9159","17.6791"],[" Montreal, QC","Canada","2","0","0","45.5017","-73.5673"],["","Hungary","2","0","0","47.1625","19.5033"],["","Indonesia","2","0","0","-0.7893","113.9213"],["","Morocco","2","0","0","31.7917","-7.0926"],["","Slovenia","2","0","0","46.1512","14.9955"],["Bergen County, NJ","US","2","0","0","40.9263","-74.077"],["Fulton County, GA","US","2","0","0","33.8034","-84.3963"],["Grafton County, NH","US","2","0","0","43.9088","-71.82600000000001"],["Harris County, TX","US","2","0","0","29.7752","-95.3103"],["Hillsborough, FL","US","2","0","0","27.9904","-82.3018"],["Placer County, CA","US","2","1","0","39.0916","-120.8039"],["Providence, RI","US","2","0","0","41.824","-71.4128"],["Sacramento County, CA","US","2","0","0","38.4747","-121.3542"],["San Benito, CA","US","2","0","0","36.5761","-120.9876"],["San Francisco County, CA","US","2","0","0","37.7749","-122.4194"],["San Mateo, CA","US","2","0","0","37.563","-122.3255"],["Washington County, OR","US","2","0","0","45.547","-123.1386"],["","Afghanistan","1","0","0","33.0","65.0"],["","Andorra","1","0","0","42.5063","1.5218"],["","Argentina","1","0","0","-38.4161","-63.6167"],["","Armenia","1","0","0","40.0691","45.0382"],["Northern Territory","Australia","1","0","0","-12.4634","130.8456"],["Tasmania","Australia","1","0","0","-41.4545","145.9707"],["","Cambodia","1","0","1","11.55","104.9167"],["London, ON","Canada","1","0","1","42.9849","-81.2453"],["","Dominican Republic","1","0","0","18.7357","-70.1627"],["","Faroe Islands","1","0","0","61.8926","-6.9118"],["","Gibraltar","1","0","0","36.1408","-5.3536"],["","Jordan","1","0","0","31.24","36.51"],["","Latvia","1","0","0","56.8796","24.6032"],["","Liechtenstein","1","0","0","47.14","9.55"],["","Lithuania","1","0","0","55.1694","23.8813"],["","Luxembourg","1","0","0","49.8153","6.1296"],["Tibet","Mainland China","1","0","1","31.6927","88.0924"],["","Monaco","1","0","0","43.7333","7.4167"],["","Nepal","1","0","1","28.1667","84.25"],["","Nigeria","1","0","0","9.082","8.6753"],["","North Macedonia","1","0","0","41.6086","21.7453"],["","Poland","1","0","0","51.9194","19.1451"],["","South Africa","1","0","0","-30.5595","22.9375"],["","Sri Lanka","1","0","1","7.0","81.0"],["","Tunisia","1","0","0","34.0","9.0"],[" Norfolk County, MA","US","1","0","0","42.1767","-71.1449"],["Berkeley, CA","US","1","0","0","37.8715","-122.273"],["Boston, MA","US","1","0","1","42.3601","-71.0589"],["Clark County, NV","US","1","0","0","36.0796","-115.094"],["Contra Costa County, CA","US","1","0","0","37.8534","-121.9018"],["Fort Bend County, TX","US","1","0","0","29.5693","-95.8143"],["Grant County, WA","US","1","0","0","47.1981","-119.3732"],["Humboldt County, CA","US","1","0","0","40.745","-123.8695"],["Madison, WI","US","1","0","1","43.0731","-89.4012"],["Maricopa County, AZ","US","1","0","0","33.2918","-112.4291"],["Queens County, NY","US","1","0","0","40.7282","-73.7949"],["San Antonio, TX","US","1","0","0","29.4241","-98.4936"],["Santa Rosa County, FL","US","1","0","0","30.769","-86.9824"],["Sarasota, FL","US","1","0","0","27.3364","-82.5307"],["Sonoma County, CA","US","1","0","0","38.578","-122.9888"],["Tempe, AZ","US","1","0","1","33.4255","-111.94"],["Umatilla, OR","US","1","0","0","45.775","-118.7606"],["Wake County, NC","US","1","0","0","35.8032","-78.5661"],["Williamson County, TN","US","1","0","0","35.9179","-86.8622"],["","Ukraine","1","0","0","48.3794","31.1656"],["From Diamond Princess","Australia","0","0","0","35.4437","139.638"],["Lackland, TX (From Diamond Princess)","US","0","0","0","29.3829","-98.6134"],["Omaha, NE (From Diamond Princess)","US","0","0","0","41.2545","-95.9758"],["Travis, CA (From Diamond Princess)","US","0","0","0","38.2721","-121.9399"]]
```
