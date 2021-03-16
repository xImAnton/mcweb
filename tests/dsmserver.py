from mcweb.mc.dsm.dsm import DSMPortListener


dsm = DSMPortListener(("localhost", 25565))
dsm.run()
