            $(document).ready(function()
            {
                var feeds = [
//                    {
//                        title: 'One India',
//                        url: 'http://feeds.feedburner.com/oneindia-news-india'
//                    },
                    {
                        title: 'Google World News',
                        url: 'http://news.google.com/?output=rss'
                    },

                    {
                        title: 'Times Of India',
                        url: 'http://timesofindia.indiatimes.com/rssfeedsdefault.cms'
                    }

                ];

                var options = {
                    stacked : true,
                    horizontal : false,
                    title : "Latest Headlines"
                };

                new GFdynamicFeedControl(feeds, 'contentfeed', options);
                document.getElementById('contentfeed').style.width = "250px";
            });