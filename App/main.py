from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util

from handler import ZooHandler

admins = ["pirh.badger@gmail.com","poachedbaconcake@gmail.com"]

class MainHandler(ZooHandler):
    def get(self):
        data = {}
        user = users.get_current_user()
        
        if user.email() in admins:
            data["signOut"] = users.create_logout_url("/")
            self.render_page("index.html",data)
        
        else:
            self.redirect("/denied")

class PissOffHandler(ZooHandler):
    def get(self):
        data = {}
        user = users.get_current_user()
        
        if not (user.email() in admins):
            data["signOut"] = users.create_logout_url("/")
            self.render_page("denied.html",data)
            
        else:
            self.redirect("/")

def main():
    application = webapp.WSGIApplication([
        ("/", MainHandler),
        ("/denied", PissOffHandler),
        ], debug=True)
    util.run_wsgi_app(application)

if __name__ == "__main__":
    main()
